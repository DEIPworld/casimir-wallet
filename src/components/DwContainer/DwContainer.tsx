// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

export const DwContainer = defineComponent({
  name: 'DwContainer',

  props: {
    className: {
      type: String,
      default: ''
    }
  },

  setup(props, { slots }) {
    return () => (
      <div class={`container ${props.className}`}>
        {() => slots}
      </div>
    );
  }
});
