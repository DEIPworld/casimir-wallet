// Lib
import { defineComponent } from 'vue';

// Styles
import './styles.scss';

const Container = defineComponent({
  name: 'Container',

  props: {
    className: {
      type: String,
      default: '',
    },
  },

  setup(props, { slots }) {
    return () => (
      <div class={`container ${props.className}`}>
        {() => slots}
      </div>
    );
  },
});

export default Container;
