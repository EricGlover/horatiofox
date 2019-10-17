class Terminal {
    constructor() {
        this.$terminal = null;
        this._out = "";
    }

    echo(str) {
        this._out += str;
    }

    newLine() {
        this._out += "\n";
    }

    printLine(str) {
        this._out += str + "\n";
    }

    getOutput() {
        return this._out;
    }

    clear() {
        this._out = "";
    }

    print() {
        this.$terminal.echo(this._out);
        this._out = "";
    }

    /**
     *
     * Specify a column width or defaults to the largest
     * @param grid array<array<string>>
     * @param columnWidth int
     * @returns array<array<string>>
     */
    formatGrid(grid, padLeft = true, columnWidth = null) {
        // get longest string that we'll use for data
        var longest = grid.reduce((l, row) => {
            var l2 = row.reduce((carry, d) => {
                return carry > d.length ? carry : d.length;
            }, 0);
            return l > l2 ? l : l2;
        }, 0)
        if (columnWidth === null) {
            columnWidth = longest;
        }
        return grid.map(row => {
            return row.map(str => {
                if (padLeft) {
                    return str.padStart(columnWidth)
                } else {
                    return str.padEnd(columnWidth);
                }
            });
        });
    }

    /**
     * @param grid
     * @param columnSeparator
     * @param rowSeparator
     */
    printGrid(grid, columnSeparator = " ", rowSeparator = "\n", echo = false) {
        var rows = [];
        for (var i = 0; i < grid.length; i++) {
            // make line of text for row
            var row = grid[i];
            var line = row.join(columnSeparator);
            rows.push(line + "\n");
        }
        var text = rows.join(rowSeparator);
        if (echo) {
            this.$terminal.echo(text);
        }
        return text;
    };
}

export const terminal = new Terminal();