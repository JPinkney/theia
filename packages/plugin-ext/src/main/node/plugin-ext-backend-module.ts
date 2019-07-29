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

import { interfaces } from 'inversify';
import { PluginApiContribution } from './plugin-service';
import { BackendApplicationContribution, CliContribution } from '@theia/core/lib/node';
import { PluginsKeyValueStorage } from './plugins-key-value-storage';
import { PluginDeployerContribution } from './plugin-deployer-contribution';
import {
    PluginDeployer, PluginDeployerResolver, PluginDeployerFileHandler,
    PluginDeployerDirectoryHandler, PluginServer, pluginServerJsonRpcPath, metricsJsonRpcPath, PluginMetrics
} from '../../common/plugin-protocol';
import { PluginDeployerImpl } from './plugin-deployer-impl';
import { LocalDirectoryPluginDeployerResolver } from './resolvers/plugin-local-dir-resolver';
import { PluginTheiaFileHandler } from './handlers/plugin-theia-file-handler';
import { PluginTheiaDirectoryHandler } from './handlers/plugin-theia-directory-handler';
import { GithubPluginDeployerResolver } from './plugin-github-resolver';
import { HttpPluginDeployerResolver } from './plugin-http-resolver';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { PluginPathsService, pluginPathsServicePath } from '../common/plugin-paths-protocol';
import { PluginPathsServiceImpl } from './paths/plugin-paths-service';
import { PluginServerHandler } from './plugin-server-handler';
import { PluginCliContribution } from './plugin-cli-contribution';
import { MetricsContribution } from '@theia/metrics/lib/node/metrics-contribution';
import { PluginMetricsContribution } from './plugin-metrics';
import { PluginMetricsHandler } from './plugin-metrics-handler';

export function bindMainBackend(bind: interfaces.Bind): void {
    bind(PluginApiContribution).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(PluginApiContribution);

    bind(PluginDeployer).to(PluginDeployerImpl).inSingletonScope();
    bind(PluginDeployerContribution).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(PluginDeployerContribution);

    bind(PluginDeployerResolver).to(LocalDirectoryPluginDeployerResolver).inSingletonScope();
    bind(PluginDeployerResolver).to(GithubPluginDeployerResolver).inSingletonScope();
    bind(PluginDeployerResolver).to(HttpPluginDeployerResolver).inSingletonScope();

    bind(PluginDeployerFileHandler).to(PluginTheiaFileHandler).inSingletonScope();
    bind(PluginDeployerDirectoryHandler).to(PluginTheiaDirectoryHandler).inSingletonScope();

    bind(PluginServer).to(PluginServerHandler).inSingletonScope();

    bind(PluginsKeyValueStorage).toSelf().inSingletonScope();

    bind(PluginPathsService).to(PluginPathsServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(pluginPathsServicePath, () =>
            ctx.container.get(PluginPathsService)
        )
    ).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(pluginServerJsonRpcPath, () =>
            ctx.container.get(PluginServer)
        )
    ).inSingletonScope();

    bind(PluginCliContribution).toSelf().inSingletonScope();
    bind(CliContribution).toService(PluginCliContribution);

    bind(PluginMetrics).to(PluginMetricsHandler).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(metricsJsonRpcPath, () =>
            ctx.container.get(PluginMetrics)
        )
    ).inSingletonScope();

    bind(MetricsContribution).to(PluginMetricsContribution).inSingletonScope();
}
