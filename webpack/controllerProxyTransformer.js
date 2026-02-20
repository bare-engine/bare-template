const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const externalClassInfoMap = collectClassInfoFromDirs([
    path.resolve(process.cwd(), "../BareEngine/src"),
    path.resolve(process.cwd(), "node_modules/bare-engine/src")
]);

function createControllerProxyTransformer(program) {
    const registeredAcrossProgram = program
        ? collectRegisteredControllersFromProgram(program)
        : null;
    const classInfoMap = program ? collectClassInfo(program) : new Map();
    if (externalClassInfoMap) {
        for (const [name, info] of externalClassInfoMap) {
            if (!classInfoMap.has(name)) {
                classInfoMap.set(name, info);
            }
        }
    }
    const typeChecker = program ? program.getTypeChecker() : null;
    const explicitControllers = new Set([
        "componentController",
        "hitboxController",
        "mouseController",
        "objectController",
        "particleController",
        "physicsControllerBare",
        "physicsControllerSopiro",
        "tweenController",
        "cameraHandler",
        "levelHandler"
    ]);

    return (context) => {
        const factory = context.factory || ts;

        const createThisScene = () =>
            factory.createPropertyAccessExpression(factory.createThis(), "scene");

        const createThisSceneProperty = (name) =>
            factory.createPropertyAccessExpression(createThisScene(), name);

        const createThisProperty = (name) =>
            factory.createPropertyAccessExpression(factory.createThis(), name);

        return (sourceFile) => {
            const registeredControllers = explicitControllers;

            function visit(node) {
                if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
                    return transformClass(node);
                }
                return ts.visitEachChild(node, visit, context);
            }

            function transformClass(node) {
                const hasScene = classHasSceneProperty(node);
                const extendsScene = classExtendsScene(node);
                const extendsSceneCarrier = extendsScene
                    || (classInfoMap
                        ? classHasSceneInHierarchy(node, classInfoMap)
                        : classExtendsSceneCarrier(node))
                    || (typeChecker
                        ? classHasSceneInDeclHierarchy(node, typeChecker)
                        : false)
                    || (typeChecker
                        ? classHasSceneInTypeHierarchy(node, typeChecker)
                        : false);
                let needsScene = false;

                const createTweenToSceneArg = () =>
                    extendsScene ? factory.createThis() : createThisScene();

                function maybeTransformTweenToCall(callNode) {
                    if (!ts.isIdentifier(callNode.expression)) {
                        return callNode;
                    }
                    if (callNode.expression.text !== "TweenTo") {
                        return callNode;
                    }

                    const args = callNode.arguments.slice();

                    if (args.length < 3) {
                        args.push(factory.createObjectLiteralExpression());
                    }
                    if (args.length < 4) {
                        args.push(factory.createTrue());
                    }
                    if (args.length < 5) {
                        if (!extendsScene) {
                            needsScene = true;
                        }
                        args.push(createTweenToSceneArg());
                    }

                    return factory.updateCallExpression(
                        callNode,
                        callNode.expression,
                        callNode.typeArguments,
                        args
                    );
                }

                function visitInClass(n) {
                    if (ts.isCallExpression(n)) {
                        const updated = maybeTransformTweenToCall(n);
                        if (updated !== n) {
                            return ts.visitEachChild(updated, visitInClass, context);
                        }
                    }
                    if (ts.isIdentifier(n) && isIdentifierReference(n)) {
                        const name = n.text;

                        if (name === "bare") {
                            if (extendsScene) {
                                return factory.createThis();
                            }
                            needsScene = true;
                            return createThisScene();
                        }

                        if (registeredControllers.has(name)) {
                            if (extendsScene) {
                                return createThisProperty(name);
                            }
                            needsScene = true;
                            return createThisSceneProperty(name);
                        }
                    }

                    return ts.visitEachChild(n, visitInClass, context);
                }

                const updatedMembers = node.members.map((member) => {
                    if (
                        ts.isConstructorDeclaration(member)
                        || ts.isMethodDeclaration(member)
                        || ts.isGetAccessorDeclaration(member)
                        || ts.isSetAccessorDeclaration(member)
                        || ts.isPropertyDeclaration(member)
                    ) {
                        return ts.visitEachChild(member, visitInClass, context);
                    }
                    return member;
                });

                const updated = ts.isClassDeclaration(node)
                    ? factory.updateClassDeclaration(
                        node,
                        node.modifiers,
                        node.name,
                        node.typeParameters,
                        node.heritageClauses,
                        updatedMembers
                    )
                    : factory.updateClassExpression(
                        node,
                        node.modifiers,
                        node.name,
                        node.typeParameters,
                        node.heritageClauses,
                        updatedMembers
                    );

                if (needsScene && !hasScene && !extendsSceneCarrier) {
                    const className = node.name ? node.name.text : "<anonymous>";
                    throw new Error(
                        `[controller-proxy] ${sourceFile.fileName}: class ${className} must define a scene property`
                    );
                }

                return updated;
            }

            return ts.visitNode(sourceFile, visit);
        };
    };
}

function collectRegisteredControllersFromProgram(program) {
    const names = new Set();
    for (const sourceFile of program.getSourceFiles()) {
        if (sourceFile.isDeclarationFile) {
            continue;
        }
        const fileNames = collectRegisteredControllers(sourceFile);
        for (const name of fileNames) {
            names.add(name);
        }
    }
    return names;
}

function collectClassInfo(program) {
    const map = new Map();

    for (const sourceFile of program.getSourceFiles()) {
        if (sourceFile.isDeclarationFile) {
            continue;
        }

        ts.forEachChild(sourceFile, (node) => {
            if (!ts.isClassDeclaration(node) || !node.name) {
                return;
            }
            const name = node.name.text;
            const hasScene = classHasSceneProperty(node);
            const bases = getBaseClassNames(node);
            map.set(name, { hasScene, bases });
        });
    }

    return map;
}

function collectClassInfoFromDirs(dirs) {
    const map = new Map();

    for (const dir of dirs) {
        if (!dir || !fs.existsSync(dir)) {
            continue;
        }
        const files = listTsFiles(dir);
        for (const filePath of files) {
            const sourceText = fs.readFileSync(filePath, "utf8");
            const sourceFile = ts.createSourceFile(
                filePath,
                sourceText,
                ts.ScriptTarget.Latest,
                true,
                ts.ScriptKind.TS
            );

            ts.forEachChild(sourceFile, (node) => {
                if (!ts.isClassDeclaration(node) || !node.name) {
                    return;
                }
                const name = node.name.text;
                const hasScene = classHasSceneProperty(node);
                const bases = getBaseClassNames(node);
                if (!map.has(name)) {
                    map.set(name, { hasScene, bases });
                }
            });
        }
    }

    return map;
}

function listTsFiles(rootDir) {
    const results = [];
    const stack = [rootDir];

    while (stack.length > 0) {
        const current = stack.pop();
        const entries = fs.readdirSync(current, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }
            if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
                results.push(fullPath);
            }
        }
    }

    return results;
}

function collectRegisteredControllers(sourceFile) {
    const names = new Set();

    function collect(node) {
        if (ts.isCallExpression(node)) {
            const expression = node.expression;
            if (ts.isPropertyAccessExpression(expression)) {
                const isRegisterCall =
                    ts.isIdentifier(expression.expression)
                    && expression.expression.text === "BareEngine"
                    && expression.name.text === "RegisterController";

                if (isRegisterCall && node.arguments.length > 0) {
                    const firstArg = node.arguments[0];
                    if (ts.isIdentifier(firstArg)) {
                        const controllerName = lowerFirst(firstArg.text);
                        names.add(controllerName);
                    }
                }
            }
        }

        ts.forEachChild(node, collect);
    }

    collect(sourceFile);
    return names;
}

function lowerFirst(value) {
    if (!value) {
        return value;
    }
    return value[0].toLowerCase() + value.slice(1);
}

function classHasSceneProperty(node) {
    return node.members.some((member) => {
        if (
            (ts.isPropertyDeclaration(member)
                || ts.isGetAccessorDeclaration(member)
                || ts.isSetAccessorDeclaration(member)
                || ts.isMethodDeclaration(member))
            && member.name
            && ts.isIdentifier(member.name)
        ) {
            return member.name.text === "scene";
        }

        if (ts.isConstructorDeclaration(member)) {
            return member.parameters.some((param) => {
                if (!param.name || !ts.isIdentifier(param.name)) {
                    return false;
                }
                if (param.name.text !== "scene") {
                    return false;
                }
                return hasParamPropertyModifier(param);
            });
        }

        return false;
    });
}

function classExtendsScene(node) {
    if (!node.heritageClauses) {
        return false;
    }

    for (const clause of node.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
            continue;
        }
        for (const type of clause.types) {
            const expression = type.expression;
            if (ts.isIdentifier(expression) && expression.text === "Scene") {
                return true;
            }
            if (
                ts.isPropertyAccessExpression(expression)
                && expression.name.text === "Scene"
            ) {
                return true;
            }
        }
    }

    return false;
}

function classExtendsSceneCarrier(node) {
    if (!node.heritageClauses) {
        return false;
    }

    for (const clause of node.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
            continue;
        }
        for (const type of clause.types) {
            const expression = type.expression;
            if (ts.isIdentifier(expression) && expression.text === "GameObject") {
                return true;
            }
            if (
                ts.isPropertyAccessExpression(expression)
                && expression.name.text === "GameObject"
            ) {
                return true;
            }
        }
    }

    return false;
}

function classHasSceneInHierarchy(node, classInfoMap) {
    const bases = getBaseClassNames(node);
    if (bases.length === 0) {
        return false;
    }

    const visited = new Set();

    function walk(baseName) {
        if (!baseName || visited.has(baseName)) {
            return false;
        }
        visited.add(baseName);

        const info = classInfoMap.get(baseName);
        if (!info) {
            return false;
        }
        if (info.hasScene) {
            return true;
        }
        return info.bases.some(walk);
    }

    return bases.some(walk);
}

function classHasSceneInDeclHierarchy(node, checker) {
    const visited = new Set();

    function walkDeclaration(decl) {
        if (!decl || visited.has(decl)) {
            return false;
        }
        visited.add(decl);

        if (classHasSceneProperty(decl)) {
            return true;
        }

        const bases = decl.heritageClauses
            ? decl.heritageClauses
                .filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
                .flatMap((clause) => clause.types)
            : [];

        for (const baseType of bases) {
            const baseDecls = resolveClassDeclarationsFromType(baseType, checker);
            for (const baseDecl of baseDecls) {
                if (walkDeclaration(baseDecl)) {
                    return true;
                }
            }
        }

        return false;
    }

    const baseTypes = node.heritageClauses
        ? node.heritageClauses
            .filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
            .flatMap((clause) => clause.types)
        : [];

    for (const baseType of baseTypes) {
        const baseDecls = resolveClassDeclarationsFromType(baseType, checker);
        for (const baseDecl of baseDecls) {
            if (walkDeclaration(baseDecl)) {
                return true;
            }
        }
    }

    return false;
}

function resolveClassDeclarationsFromType(typeNode, checker) {
    const expression = typeNode.expression || typeNode;
    const result = [];

    const symbol = getAliasedSymbol(checker.getSymbolAtLocation(expression), checker);
    if (symbol) {
        const declarations = symbol.getDeclarations() || [];
        result.push(
            ...declarations.filter(
                (decl) => ts.isClassDeclaration(decl) || ts.isClassExpression(decl)
            )
        );
    }

    const baseType = checker.getTypeAtLocation(expression);
    if (baseType) {
        const symbolFromType = getAliasedSymbol(baseType.getSymbol(), checker);
        if (symbolFromType) {
            const declarations = symbolFromType.getDeclarations() || [];
            result.push(
                ...declarations.filter(
                    (decl) => ts.isClassDeclaration(decl) || ts.isClassExpression(decl)
                )
            );
        }

        const nodeFromType = baseType.symbol && baseType.symbol.valueDeclaration
            ? baseType.symbol.valueDeclaration
            : null;
        if (nodeFromType && (ts.isClassDeclaration(nodeFromType) || ts.isClassExpression(nodeFromType))) {
            result.push(nodeFromType);
        }
    }

    const seen = new Set();
    return result.filter((decl) => {
        if (seen.has(decl)) {
            return false;
        }
        seen.add(decl);
        return true;
    });
}


function classHasSceneInTypeHierarchy(node, checker) {
    const visited = new Set();

    function walkType(type) {
        if (!type || visited.has(type)) {
            return false;
        }
        visited.add(type);

        if (typeHasSceneProperty(type, checker)) {
            return true;
        }

        const baseTypes = type.getBaseTypes ? type.getBaseTypes() : [];
        for (const baseType of baseTypes || []) {
            if (walkType(baseType)) {
                return true;
            }
        }

        return false;
    }

    const classType = checker.getTypeAtLocation(node);
    return walkType(classType);
}

function typeHasSceneProperty(type, checker) {
    if (!type) {
        return false;
    }

    const sceneProp = type.getProperty("scene");
    if (sceneProp) {
        return true;
    }

    const symbol = getAliasedSymbol(type.getSymbol(), checker);
    if (symbol) {
        const declared = checker.getDeclaredTypeOfSymbol(symbol);
        if (declared && declared !== type && declared.getProperty("scene")) {
            return true;
        }
    }

    const constructSignatures = type.getConstructSignatures
        ? type.getConstructSignatures()
        : [];
    for (const signature of constructSignatures) {
        const params = signature.getParameters();
        for (const param of params) {
            if (param.getName() === "scene") {
                return true;
            }
        }
    }

    return false;
}

function getAliasedSymbol(symbol, checker) {
    if (!symbol) {
        return null;
    }
    if (symbol.flags & ts.SymbolFlags.Alias) {
        return checker.getAliasedSymbol(symbol);
    }
    return symbol;
}

function getBaseClassNames(node) {
    if (!node.heritageClauses) {
        return [];
    }

    const bases = [];
    for (const clause of node.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
            continue;
        }
        for (const type of clause.types) {
            const expression = type.expression;
            if (ts.isIdentifier(expression)) {
                bases.push(expression.text);
            } else if (ts.isPropertyAccessExpression(expression)) {
                bases.push(expression.name.text);
            }
        }
    }

    return bases;
}

function hasParamPropertyModifier(param) {
    if (!param.modifiers) {
        return false;
    }
    return param.modifiers.some((modifier) =>
        modifier.kind === ts.SyntaxKind.PublicKeyword
        || modifier.kind === ts.SyntaxKind.PrivateKeyword
        || modifier.kind === ts.SyntaxKind.ProtectedKeyword
        || modifier.kind === ts.SyntaxKind.ReadonlyKeyword
    );
}

function isIdentifierReference(node) {
    const parent = node.parent;
    if (!parent) {
        return true;
    }

    if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
        return false;
    }
    if (ts.isPropertyAssignment(parent) && parent.name === node) {
        return false;
    }
    if (ts.isPropertyDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isShorthandPropertyAssignment(parent) && parent.name === node) {
        return false;
    }
    if (ts.isBindingElement(parent) && parent.name === node) {
        return false;
    }
    if (ts.isBindingElement(parent) && parent.propertyName === node) {
        return false;
    }
    if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) {
        return false;
    }
    if (ts.isNamespaceImport(parent) || ts.isNamespaceExport(parent)) {
        return false;
    }
    if (ts.isImportClause(parent) && parent.name === node) {
        return false;
    }
    if (ts.isVariableDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isParameter(parent) && parent.name === node) {
        return false;
    }
    if (ts.isFunctionDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isMethodDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isClassDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isInterfaceDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isTypeAliasDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isEnumDeclaration(parent) && parent.name === node) {
        return false;
    }
    if (ts.isEnumMember(parent) && parent.name === node) {
        return false;
    }
    if (ts.isPropertySignature(parent) && parent.name === node) {
        return false;
    }
    if (ts.isMethodSignature(parent) && parent.name === node) {
        return false;
    }
    if (ts.isTypeReferenceNode(parent) && parent.typeName === node) {
        return false;
    }
    if (ts.isExpressionWithTypeArguments(parent) && parent.expression === node) {
        return false;
    }
    if (ts.isHeritageClause(parent)) {
        return false;
    }
    if (ts.isTypeQueryNode(parent) && parent.exprName === node) {
        return false;
    }
    if (ts.isQualifiedName(parent)) {
        return false;
    }
    if (ts.isImportTypeNode(parent)) {
        return false;
    }
    if (ts.isLabeledStatement(parent) && parent.label === node) {
        return false;
    }
    if (
        (ts.isBreakStatement(parent) || ts.isContinueStatement(parent))
        && parent.label === node
    ) {
        return false;
    }

    return true;
}

module.exports = createControllerProxyTransformer;
