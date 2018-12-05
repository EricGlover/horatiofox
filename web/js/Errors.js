
function GlobalErrorHandler(logLevel) {
    const validLogLevels = ["error", "warn", "log"];
    const defaultLogLevel = "warn";

    function setLogLevel() {
        if(!validLogLevels.includes(logLevel)) {
            console.error("logLevel must be one of the following : ", validLogLevels, ". Setting logLevel to ", defaultLogLevel);
            logLevel = defaultLogLevel;
        }
    }

    function makeHumanReadableLog(e) {
        switch (e) {
            case e instanceof EvalError:
                console.error("stop using eval you fuck");
                break;
            case e instanceof InternalError:
                console.error("looks like some JS code you made fucked up");
                break;
            default:
                console.error("I couldn't even figure what error type that was so no snarky comment for you, sir!");
        }
    }

    function register() {
        window.onerror = function(message, source, lineno, colno, error) {
            switch (logLevel) {
                case "error": 
                    console.error(message, source, lineno, colno, error);
                    throw error;
                    break;
                case "log":
                    console.log(message, source, lineno, colno, error);
                    break;
                case "warn":    
                default: 
                    console.error(message, source, lineno, colno, error);
            }
            makeHumanReadableLog(error);
        };
    }

    function init() {
        setLogLevel();
        register();
    }

    return {
        register,
        init
    }
}

function FetchErrorHandler() {

    return {

    }
}

export default GlobalErrorHandler;
export {
    GlobalErrorHandler,
    FetchErrorHandler
}
/**
 * 
 * 
Error types
Section
Besides the generic Error constructor, there are seven other core error constructors in JavaScript. For client-side exceptions, see Exception handling statements.

EvalError
    Creates an instance representing an error that occurs regarding the global function eval().
InternalError
    Creates an instance representing an error that occurs when an internal error in the JavaScript engine is thrown. E.g. "too much recursion".
RangeError
    Creates an instance representing an error that occurs when a numeric variable or parameter is outside of its valid range.
ReferenceError
    Creates an instance representing an error that occurs when de-referencing an invalid reference.
SyntaxError
    Creates an instance representing a syntax error that occurs while parsing code in eval().
TypeError
    Creates an instance representing an error that occurs when a variable or parameter is not of a valid type.
URIError
    Creates an instance representing an error that occurs when encodeURI() or decodeURI() are passed invalid parameters. 
 */