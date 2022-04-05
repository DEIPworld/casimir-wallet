// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

const Button = defineComponent({
  name: 'Button',

  props: {
    className: {
      type: String,
      default: '',
    },
  },

  setup(props, { slots }) {
    return () => (
      <button class={`button ${props.className}`}>
        {() => slots}
      </button>
    );
  },
});

export default Button;
