export class Utility {
    static quoteListAndAddOr(list) {
        if(list.length > 1) {
            list = list.map(s =>`"${s}"`);
            list[list.length - 1] = 'or ' + list[list.length - 1];
            return list.join(', ');
        } else {
            return list;
        }
    }

    static listPrefixLast(list, word) {
        if(list.length > 1) {
            list[list.length - 1] = word + ' ' + list[list.length - 1];
        }
        return list;
    }

    // ceil is a bit misleading because negatives round down
    static ceilFloatAtFixedPoint(f, digits) {
        if(f === 0) return 0;
        f *= 10 ** digits;
        if(f < 0) {
            f = Math.floor(f);
        } else {
            f = Math.ceil(f);
        }
        return f / 10 ** digits;
    }
}