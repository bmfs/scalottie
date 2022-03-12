import { reactive, ref } from "vue";

export default class Minifier {
  readonly log = ref<string[]>([]);
  ready = ref(false);
  state = reactive({ ready: false });

  private worker: Worker;
  private resolvers: Record<
    string,
    { resolve: (value: any) => void; reject: (value: any) => void }
  > = {};
  private idCounter: number = 0;

  constructor() {
    const vm = this;
    this.worker = new Worker("js/worker.js");
    this.worker.onmessage = function (event) {
      var message = event.data;
      if (message.type == "ready") {
        vm.state.ready = true;
      } else if (message.type == "stdout") {
        vm.log.value.push(message.data);
      } else if (message.type == "start") {
        vm.log.value.push("Worker has received command");
      } else if (message.type == "error") {
        console.error("failed", message);
        const id = message.id;
        if (!(id in vm.resolvers)) {
          console.error(`failed to find resolver for request #${id}`);
          return;
        }
        const { reject } = vm.resolvers[id];
        reject(message.error);
      } else if (message.type == "done") {
        var buffers = message.data;

        console.log("done", message.id);
        buffers &&
          buffers.forEach(function (file: { data: Uint8Array }) {
            const id = message.id;
            if (!(id in vm.resolvers)) {
              console.error(`failed to find resolver for request #${id}`);
              return;
            }
            const { resolve } = vm.resolvers[id];
            resolve(Buffer.from(file.data.buffer));
          });
      }
    };
  }

  minify(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const id = `${++this.idCounter}`;
      this.resolvers[id] = { resolve, reject };

      this.worker.postMessage({
        type: "command",
        arguments: { quality: "90-100", speed: "1" },
        file: {
          id,
          data: data,
        },
      });
    });
  }
}
