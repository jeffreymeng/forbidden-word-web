declare global {
    interface String {
        matchAll(regexp: RegExp): IterableIterator<RegExpExecArray>;
    }
}


export {};