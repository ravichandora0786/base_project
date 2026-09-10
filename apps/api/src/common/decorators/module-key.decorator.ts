import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'module_key';
export const ModuleKey = (moduleKey: string) => SetMetadata(MODULE_KEY, moduleKey);

export const BYPASS_MODULE_ACTIVE_KEY = 'bypass_module_active';
export const BypassModuleActive = () => SetMetadata(BYPASS_MODULE_ACTIVE_KEY, true);
