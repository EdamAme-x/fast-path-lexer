type PathSeparator = {
    type: "separator",
    value: "/"
}

type PathStatic = {
    type: "static",
    value: string
}

type PathDynamic = {
    type: "dynamic",
    value: string,
    regex: string
}

type PathWildcard = {
    type: "wildcard",
    value: "*"
}

type PathElement = PathSeparator | PathStatic | PathDynamic | PathWildcard

type PathTree = PathElement[]

const pathLexer = (path: string): PathTree => {
    const reader = (function* () {
        while (path.length) {
            yield path[0]
            path = path.slice(1)
        }

        return null
    })()

    const pathTree: PathTree = []

    const staticPathLexer = (staticPath: string) => {

        while (true) {
            const char = reader.next().value
            if (!char) {
                pathTree.push({
                    type: "static",
                    value: staticPath
                })

                break
            }

            if (char === "/") {
                pathTree.push({
                    type: "static",
                    value: staticPath
                })

                pathTree.push({
                    type: "separator",
                    value: "/"
                })

                break
            }

            staticPath += char
        }        
    }

    const dynamicPathLexer = () => {
        let paramName = ""
        let regex = ""

        const dynamicPathRegexLexer = () => {
            while (true) {
                const char = reader.next().value

                if (!char) {
                    break
                }

                if (char === "}") {
                    break
                }

                regex += char
            }
        }

        while (true) {
            const char = reader.next().value

            if (!char) {
                pathTree.push({
                    type: "dynamic",
                    value: paramName,
                    regex
                })

                break
            }

            if (char === "/") {
                pathTree.push({
                    type: "dynamic",
                    value: paramName,
                    regex
                })

                pathTree.push({
                    type: "separator",
                    value: "/"
                })

                break
            }

            if (char === "{") {
                dynamicPathRegexLexer()
                continue
            }
            
            paramName += char
        }
    }

    for (const char of reader) {
        switch (char) {
            case "/":
                pathTree.push({
                    type: "separator",
                    value: char
                })
                continue
            case ":":
                dynamicPathLexer()
                continue
            case "*":
                pathTree.push({
                    type: "wildcard",
                    value: char
                })
                continue
            default:
                staticPathLexer(char)
                continue
        }
    }

    return pathTree
}

const pathTree = pathLexer("/abc/:id{\\d+}/*")

console.log(pathTree)
