// Lib
import { defineComponent } from 'vue';

const Button = defineComponent({
  name: 'Button',

  props: {
    className: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    return () => (
      <button class={`button ${props.className}`}>
        <slot />
      </button>
    );
  },
});

export default Button;
