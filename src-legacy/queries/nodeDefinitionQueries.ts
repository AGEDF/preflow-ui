/**
 * TanStack Query definitions for node definitions (transformations)
 */

import { queryOptions } from '@tanstack/react-query';
import { nodeDefinitionApi } from '../services/api';

export const nodeDefinitionQueries = {
  /**
   * Query options for listing all available node definitions
   */
  all: () =>
    queryOptions({
      queryKey: ['nodeDefinitions'],
      queryFn: () => nodeDefinitionApi.listNodeDefinitions(),
      staleTime: 300000, // 5 minutes (rarely changes)
    }),

  /**
   * Query options for fetching a specific node definition
   */
  byId: (nodeDefId: string) =>
    queryOptions({
      queryKey: ['nodeDefinition', nodeDefId],
      queryFn: () => nodeDefinitionApi.getNodeDefinition(nodeDefId),
      staleTime: 300000, // 5 minutes
    }),
};
