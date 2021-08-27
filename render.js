//生成虚拟节点阶段vnode组成一个vdom树
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};

// 虚拟节点转化为真实dom --真实渲染阶段
const mount = (vnode, container) => {
  vnode.el = document.createElement(vnode.tag);
  const el = vnode.el;

  //处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];
      if (key.startsWith('on')) {
        //添加事件监听
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        //添加el的属性
        el.setAttribute(key, value);
      }
    }
  }

  // 处理children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children;
    } else {
      //数组情况下递归调用
      const flag = vnode.children instanceof Array;
      flag ? '' : (vnode.children = [vnode.children]); //不是数组变成数组

      vnode.children.forEach((item) => {
        mount(item, el);
      });
    }
  }

  // 将el挂载到container上
  container.appendChild(el);
};

//进旧节点进行比较阶段 俗称打补丁阶段
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const elParent = n1.el.parentElement;
    elParent.removeChild(n1.el);
    mount(n2, elParent);
  } else {
    n2.el = n1.el;
    const el = n2.el;
    //1.新旧props比较
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 因为新vnode上的props必须添加到el上所以进行第一次比较
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (oldValue !== newValue) {
        //新props必须添加到el上
        if (key.startsWith('on')) {
          //移除之前的点击事件
          el.removeEventListener(key.slice(2).toLowerCase(), oldValue);
          //覆盖事件监听
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          //添加或者覆盖el的属性
          el.setAttribute(key, newValue);
        }
      }
    }
    // 因为旧vnode上的props如果在新props上没有的key就在el上删除这些props 进行第二次比较
    for (const key in oldProps) {
      if (!(key in newProps)) {
        //旧props对比
        if (key.startsWith('on')) {
          //删除事件监听
          const v = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), v);
        } else {
          //删除el的属性
          el.removeAttribute(key);
        }
      }
    }

    //2.新旧children比较
    const oldChild = n1.children || [];
    const newChild = n2.children || [];
    if (typeof newChild === 'string') {
      // 边界判断 极端情况的产生
      if (typeof oldChild === 'string') {
        //新旧children都是string类型
        if (newChild !== oldChild) {
          el.textContent = newChild;
        }
      } else {
        // 新旧类型有一个不是string所以得直接更改元素下面的html
        el.innerHtml = newChild;
        console.log(el)
      }
    } else {
      if (typeof oldChild === 'string') {
        el.innerHtml = '';
        newChild.forEach((item) => {
          mount(item, el);
        });
      } else {
        //没有key的对比实现
        const commonLeng = Math.min(oldChild.length, newChild.length); //最小遍历公因数
        for (let i = 0; i < commonLeng; i++) {
          patch(oldChild[i], newChild[i]);
        }

        if (oldChild.length > newChild.length) {
          //做删除操作
          oldChild.slice(commonLeng).forEach((item) => {
            el.removeChild(item.el);
          });
        }

        if (newChild.length > oldChild.length) {
          //做新增操作
          newChild.slice(commonLeng).forEach((item) => {
            mount(item, el);
          });
        }
      }
    }
  }
};
