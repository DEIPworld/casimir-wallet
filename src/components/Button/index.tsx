// Lib
import { defineComponent } from 'vue';

const Button = defineComponent({
  name: 'Button',

  props: {
    className: {
      type: String,
    },
  },

  render() {
    return (
      <button class="button" v-bind:class="className">
        <slot/>
      </button>
    );
  },
});

export default Button;
