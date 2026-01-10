// storage simples com a mesma "cara" do window.storage que você usou antes
export const storage = {
  async get(key) {
    return { value: localStorage.getItem(key) };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async remove(key) {
    localStorage.removeItem(key);
  },
};
