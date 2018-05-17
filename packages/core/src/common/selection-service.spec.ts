/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as assert from 'assert';
import * as chai from "chai";
import { SelectionService } from './selection-service';
import { Disposable } from './disposable';

// tslint:disable:no-unused-expression

const expect = chai.expect;

describe('selection-service', () => {

    it('01 #addListener and dispose', () => {
        const service = createSelectionService();
        const events: any[] = [];
        const disposable = service.onSelectionChanged(
            e => events.push(e)
        );
        service.selection = "foo";
        disposable.dispose();
        service.selection = "bar";
        expect(events.length).equals(1);
        expect(events[0]).equals("foo");
    });

    it('setSelection 01', () => {
        const service = createSelectionService();
        assert.equal(service.selection, undefined);

        const source = Disposable.NULL;
        service.selection = source;
        assert.equal(service.selection, source);

        source.dispose();
        assert.equal(service.selection, undefined);
    });

    it('setSelection 02', () => {
        const service = createSelectionService();
        assert.equal(service.selection, undefined);

        const source = Disposable.NULL;
        service.selection = source;
        assert.equal(service.selection, source);

        service.selection = "bar";
        source.dispose();
        assert.equal(service.selection, "bar");
    });

});

function createSelectionService() {
    return new SelectionService();
}
