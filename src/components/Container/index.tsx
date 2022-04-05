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

  setup(props) {
    return () => (
      <div class={`container ${props.className}`}>
        <slot />
      </div>
    );
  },
});

export default Container;
