// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

export const DwButton = defineComponent({
  name: 'DwButton',

  props: {
    className: {
      type: String,
      default: ''
    }
  },

  setup(props, { slots }) {
    return () => (
      <button class={`button ${props.className}`}>
        {() => slots}
      </button>
    );
  }
});
