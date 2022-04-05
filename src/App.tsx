// Lib
import { defineComponent } from 'vue';

// Components
import Header from '@/components/Header';

const App = defineComponent({
  name: 'App',

  render() {
    return (
      <>
        <Header />
        <router-view />
      </>
    );
  },
});

export default App;
