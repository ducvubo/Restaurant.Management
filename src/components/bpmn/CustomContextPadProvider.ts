// Custom Context Pad Provider for BPMN

export class CustomContextPadProvider {
  constructor(
    contextPad: any,
    _modeling: any,
    _elementFactory: any,
    _translate: any,
    _eventBus: any
  ) {
    contextPad.registerProvider(this);
  }

  getContextPadEntries = (_element: any) => {
    return (entries: any) => {
      // Remove unwanted context pad entries
      delete entries['replace'];
      delete entries['append.intermediate-event'];
      delete entries['append.append-task'];
      delete entries['append.end-event'];
      delete entries['append.gateway'];

      return entries;
    };
  };
}

(CustomContextPadProvider as any).$inject = [
  'contextPad',
  'modeling',
  'elementFactory',
  'translate',
  'eventBus'
];
