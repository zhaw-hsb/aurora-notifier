import { NgModule } from '@angular/core';
import { ZhawComponents } from './app/zhaw.components';
import { FormModule } from 'src/app/shared/form/form.module';

const ENTRY_COMPONENTS = [
  ...ZhawComponents
];

const DECLARATIONS = [
  ...ENTRY_COMPONENTS
];

@NgModule({
  imports: [

    /**
     * Lookup author mail
     */
    FormModule

  ],
  declarations: DECLARATIONS,
  providers: [
    ...ENTRY_COMPONENTS.map((component) => ({ provide: component }))
  ],
})
/**
 * This module is included in the main bundle that gets downloaded at first page load. So it should
 * contain only the themed components that have to be available immediately for the first page load,
 * and the minimal set of imports required to make them work. Anything you can cut from it will make
 * the initial page load faster, but may cause the page to flicker as components that were already
 * rendered server side need to be lazy-loaded again client side
 *
 * Themed EntryComponents should also be added here
 */
export class EagerThemeModule {

}


