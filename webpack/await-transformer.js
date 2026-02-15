const ts = require("typescript");

function isAwaitWrapperCall(expression) {
    return ts.isCallExpression(expression)
        && ts.isIdentifier(expression.expression)
        && expression.expression.text === "__await";
}

function createAwaitRewriteTransformer() {
    return (context) => {
        const visit = (node) => {
            if (ts.isAwaitExpression(node)) {
                const expr = node.expression;
                if (isAwaitWrapperCall(expr)) {
                    return node;
                }

                const wrapped = ts.factory.createCallExpression(
                    ts.factory.createIdentifier("__await"),
                    undefined,
                    [expr]
                );

                return ts.factory.updateAwaitExpression(node, wrapped);
            }

            return ts.visitEachChild(node, visit, context);
        };

        return (sourceFile) => ts.visitNode(sourceFile, visit);
    };
}

module.exports = { createAwaitRewriteTransformer };
