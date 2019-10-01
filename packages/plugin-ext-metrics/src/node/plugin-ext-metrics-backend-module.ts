/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
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

import { MetricsContribution } from '@theia/metrics/lib/node/metrics-contribution';
import { PluginMetricsContribution } from './plugin-metrics';
import { PluginMetrics, metricsJsonRpcPath } from '../common/metrics-protocol';
import { PluginMetricsHandler } from './plugin-metrics-handler';
import { ConnectionHandler } from '@theia/core/lib/common/messaging/handler';
import { JsonRpcConnectionHandler } from '@theia/core';
import { ContainerModule } from 'inversify';
import { MetricsContributor } from './metrics-contributor';
import { PluginMetricTimeOutput } from './metric-output/plugin-metrics-time-output';
import { PluginMetricSuccessOutput } from './metric-output/plugin-metrics-success-output';
import { MetricStringGenerator } from './metric-string-generator';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(PluginMetricTimeOutput).toSelf().inSingletonScope();
    bind(PluginMetricSuccessOutput).toSelf().inSingletonScope();
    bind(PluginMetrics).to(PluginMetricsHandler).inTransientScope();
    bind(MetricStringGenerator).toSelf().inSingletonScope();
    bind(MetricsContributor).toSelf().inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx => {
        const clients = ctx.container.get(MetricsContributor);
        return new JsonRpcConnectionHandler(metricsJsonRpcPath, client => {
            const pluginMetricsHandler: PluginMetrics = ctx.container.get(PluginMetrics);
            clients.clients.add(pluginMetricsHandler);
            client.onDidCloseConnection(() => {
                clients.clients.delete(pluginMetricsHandler);
            });
            return pluginMetricsHandler;
        });
    }
    ).inSingletonScope();

    bind(MetricsContribution).to(PluginMetricsContribution).inSingletonScope();
});
