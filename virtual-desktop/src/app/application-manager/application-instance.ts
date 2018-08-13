

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { NgModuleRef, ComponentRef, Type } from '@angular/core';

declare var Reflect: any;

// import { DesktopPluginDefinitionImpl } from 'app/plugin-manager/shared/desktop-plugin-definition';

// import { ViewportId } from './viewport-manager/viewport';



export class ApplicationInstance {
  readonly instanceId: MVDHosting.InstanceId;
  readonly plugin: MVDHosting.DesktopPluginDefinition;
  readonly viewportContents: Map<MVDHosting.ViewportId, ComponentRef<any>>;
  moduleRef: NgModuleRef<any> | null;
  mainComponent: Type<any> | null;
  isIFrame:boolean = false;
  iframeId:string;
  iframeElement:HTMLElement|null;
  inputFields: string[];
  outputFields: string[];

  constructor(instanceId: MVDHosting.InstanceId, plugin: MVDHosting.DesktopPluginDefinition) {
    this.instanceId = instanceId;
    this.plugin = plugin;
    this.viewportContents = new Map();
    this.mainComponent = null;
    this.moduleRef = null;
    this.inputFields = [];
    this.outputFields = [];
  }

  private cleanupComponentRefFor(viewportId: MVDHosting.ViewportId): void {
    const component = this.viewportContents.get(viewportId);

    if (component != null) {
      component.destroy();
    } else {
      console.warn('Attempted to clean up undefined component');
    }
  }

  deregisterViewport(viewportId: MVDHosting.ViewportId): void {
    this.cleanupComponentRefFor(viewportId);
    this.viewportContents.delete(viewportId);
  }

  getComponentRefFor(viewportId: MVDHosting.ViewportId): ComponentRef<any> | null {
    return this.viewportContents.get(viewportId) || null;
  }

  setModuleRef(moduleRef: NgModuleRef<any>): void {
    this.moduleRef = moduleRef;
  }

  setMainComponent(component: Type<any>): void {
    this.mainComponent = component;
    this.discoverMainComponentInputsAndOutputs();
  }
  
  isMainComponentInput(fieldName: string): boolean {
    return this.inputFields.find(field => field === fieldName) !== undefined;
  }
  
  isMainComponentOutput(fieldName: string): boolean {
    return this.outputFields.find(field => field === fieldName) !== undefined;
  }
  
  discoverMainComponentInputsAndOutputs(): void {
    this.inputFields = [];
    this.outputFields = [];
    const propMetadata = Reflect.getMetadata("propMetadata", this.mainComponent as object);
    for (let fieldName in propMetadata) {
      const annotation = this.getMainComponentFieldAnnotation(fieldName);
      if (annotation === '@Input') {
        this.inputFields.push(fieldName);
      } else if (annotation === '@Output') {
        this.outputFields.push(fieldName);
      }
    }
  }
  
  getMainComponentInputs(): string[] {
    return this.inputFields;
  }
  
  getMainComponentOutputs(): string[] {
    return this.outputFields;
  }
    
  getMainComponentFieldAnnotation(fieldName: string): string {
    const metaData = Reflect.getMetadata("propMetadata", this.mainComponent as object)[fieldName][0];
    return metaData.ngMetadataName /* Angular5 */ || metaData.toString() /* Angular4 */;
  }
  
  getMainComponentFieldType(fieldName: string, instance: object): Type<any> {
    return Reflect.getMetadata("design:type", instance, fieldName);
  }
 
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

