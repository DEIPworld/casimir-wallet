// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

const Container = defineComponent({
  name: 'Container',

  props: {
    className: {
      type: String,
    },
  },

  render() {
    return (
      <div class="container" v-bind:class="className">
        <slot/>
      </div>
    );
  },
});

export default Container;
