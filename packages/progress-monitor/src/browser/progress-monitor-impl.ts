/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
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

export const PROGRESS_MONITOR_WIDGET_KIND = 'progressMonitorView';

export interface IProgressMonitor {
    getWorkItem(): string;
    getText(): string;
    getProgress(): number;
}

export class ProgressMonitorImpl implements IProgressMonitor {

    private workItem: string;
    private textString: string;
    private progress: number;

    constuctor(workItem: string, textString: string, progress: number) {
        this.workItem = workItem;
        this.textString = textString;
        this.progress = progress;
    }

    getWorkItem(): string {
        return this.workItem;
    }
    getText(): string {
        return this.textString;
    }
    getProgress(): number {
        return this.progress;
    }

}
