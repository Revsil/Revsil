"use strict";

class Collection extends Map {
    constructor(baseObject, limit) {
        super();
        this.baseObject = baseObject;
        this.limit = limit;


    }
	
    add(obj, extra, replace) {
        if(this.limit === 0) {
            return (obj instanceof this.baseObject || obj.constructor.name === this.baseObject.name) ? obj : new this.baseObject(obj, extra);
        }
        if(obj.id == null) {
            throw new Error("Missing object id");
        }
        const existing = this.get(obj.id);
        if(existing && !replace) {
            return existing;
        }

    
        if(!(obj instanceof this.baseObject || obj.constructor.name === this.baseObject.name)) {
         obj = new this.baseObject(obj, extra);
        }
    

        this.set(obj.id, obj);

        if(this.limit && this.size > this.limit) {
            const iter = this.keys();
            while(this.size > this.limit) {
                this.delete(iter.next().value);
            }
        }
        return obj;
    }
	
    find(func) {
        for(const item of this.values()) {
            if(func(item)) {
                return item;
            }
        }
        return undefined;
    }
	
    random() {
        if(!this.size) {
            return undefined;
        }
        const index = Math.floor(Math.random() * this.size);
        const iter = this.values();
        let res;
        for(let i = 0; i <= index; i++) {
            res = iter.next().value;
        }
        return res;
    }
	
    filter(func) {
        const arr = [];
        for(const item of this.values()) {
            if(func(item)) {
                arr.push(item);
            }
        }
        return arr;
    }
	
    map(func) {
        const arr = [];
        for(const item of this.values()) {
            arr.push(func(item));
        }
        return arr;
    }
	
    reduce(func, initialValue) {
        const iter = this.values();
        let val;
        let result = initialValue === undefined ? iter.next().value : initialValue;
        while((val = iter.next().value) !== undefined) {
            result = func(result, val);
        }
        return result;
    }
	
    every(func) {
        for(const item of this.values()) {
            if(!func(item)) {
                return false;
            }
        }
        return true;
    }
	
    some(func) {
        for(const item of this.values()) {
            if(func(item)) {
                return true;
            }
        }
        return false;
    }
	
    update(obj, extra, replace) {
        if(!obj.id && obj.id !== 0) {
            throw new Error("Missing object id");
        }
        const item = this.get(obj.id);
        if(!item) {
            return this.add(obj, extra, replace);
        }
        item.update(obj, extra);
        return item;
    }
	
    remove(obj) {
        const item = this.get(obj.id);
        if(!item) {
            return null;
        }
        this.delete(obj.id);
        return item;
    }

    toString() {
        return `[Collection<${this.baseObject.name}>]`;
    }
}

module.exports = Collection;