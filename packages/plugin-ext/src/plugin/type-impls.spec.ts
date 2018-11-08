/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as assert from 'assert';
import { SymbolInformation, Location, Position } from './types-impl';
import URI from 'vscode-uri';

describe('Type implementations:', () => {

    describe('Create symbol information:', () => {

        it('should create symbol information with location', () => {
            const newSymbol = new SymbolInformation('name', 0, 'container', new Location(URI.parse('some_uri'), new Position(0, 0)));
            assert.equal(newSymbol.name, 'name');
            assert.equal(newSymbol.kind, 0);
            assert.equal(newSymbol.containerName, 'container');
            assert.equal(newSymbol.location.uri, URI.parse('some_uri'));
            assert.equal(newSymbol.location.range.start, 0);
            assert.equal(newSymbol.location.range.end, 0);
        });

        it('should create symbol information with undefined location', () => {
            const newSymbol = new SymbolInformation('name', 0, 'container', undefined);
            assert.equal(newSymbol.name, 'name');
            assert.equal(newSymbol.kind, 0);
            assert.equal(newSymbol.containerName, 'container');
            assert.equal(newSymbol.location, undefined);
        });

    });

});
