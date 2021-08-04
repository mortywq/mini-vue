class Dep {
  constructor() {
    this.subscriber = new Set();
  }

  depend() {
    if (activeDepend) {
      this.subscriber.add(activeDepend);
    }
  }

  notify() {
    this.subscriber.forEach((effect) => {
      effect();
    });
  }
}

let activeDepend = null;
function watchEffect(effect) {
  activeDepend = effect;
  effect();
  activeDepend = null;
}

// map  key是一个字符串
//weakmap:{key: value}  key可以是一个对象，而且是弱引用 如果target是对象，然后在方法里把target=null； 那么引用的原对象也置空了 进行垃圾回收
const targetMap = new WeakMap();
function getDep(target, key) {
  //target 被拦截的对象
  /* 1.targetMap 是用于收集依赖的一个weakmap，因为key存 target对象可以作唯一标识,通过target对象作为key值去拿对于的value
     2.targetMap 的value是一个map类型
     3.这个map的key也就是被拦截的对象的key，通过这个map的key拿到value,也就是这个key对应的Dep对象,来进行后面reactive方法里的拦截和依赖收集
  */
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    //没有值，说明第一次进行注册targetMap-key value
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    //没有值，说明第一次进行注册depsMap - key value
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

//进行数据劫持 vue2的响应式系统
/* function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key);
    let value = raw[key];
    Object.defineProperty(raw, key, {
      get() {
        //get中拦截到了，说明使用了这个数据进行对应依赖收集
        dep.depend(); 
        return value;
      },
      set(newValue) {
        if (value == newValue) {
          return;
        }
        value = newValue;
        //set中拦截到了，说明更改了数据，对相对应的依赖触发notify
        dep.notify();
      },
    });
  });
  return raw;
} */

//进行数据劫持 vue3的响应式系统
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set(target, key, newValue) {
      const dep = getDep(target, key);
      target[key] = newValue;
      dep.notify();
    },
  });
}

/* const info = reactive({ name: 'info-name' });
const info2 = reactive({ foo: 'info2-foo', name: 'info2-name' });
const info3 = reactive({ name: 'info3-name' });
const info4 = reactive({ name: 'info4-name' });

watchEffect(() => {
  console.log(info.name);
});
watchEffect(() => {
  console.log(info2.name);
});
watchEffect(() => {
  console.log(info3.name);
});
watchEffect(() => {
  console.log(info4.name);
});

setTimeout(() => {
  console.log('2秒后我改变了info2');
  info2.name = '改变了';
}, 2000); */
