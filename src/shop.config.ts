/**
 * RetailOS — Shop Configuration Loader
 *
 * Loads your shop config from `src/shops/local.config.ts` if it exists.
 * Falls back to the example config if no local config is found.
 *
 * For the private-repo pattern (symlink):
 *   ln -s ../../../shop.config.ts retail-os/src/shops/local.config.ts
 */
export type { ShopConfig } from './shop.config.types';
import config from './shops/local.config';
export default config;
