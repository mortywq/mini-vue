function createApp(rootComponent) {
  rootComponent.data = reactive(rootComponent.data);

  return {
    mount(selector) {
      const container = document.querySelector(selector);
      let isMounted = false;
      let oldVNode = null;

      watchEffect(() => {
        if (!isMounted) {
          oldVNode = rootComponent.render();
          mount(oldVNode, container);
          isMounted = true;
        } else {
          let newVnode = rootComponent.render();
          patch(oldVNode, newVnode);
          oldVNode = newVnode;
        }
      });
    }
  };
}
console.log('add');
console.log('ceshi');
console.log('xiufu');
console.log('xiufu2');