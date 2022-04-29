import { computed, defineComponent } from 'vue';
import './BodyOverlay.scss';

export const BodyOverlay = defineComponent({
  name: 'BodyOverlay',
  props: {
    animated: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const classList = computed(() => ({
      'body-overlay': true,
      'body-overlay--animated': props.animated
    }));

    const genOrb = (idx: number) => (
      <div class={`body-overlay__orb-${idx + 1}`}/>
    );

    const genOrbs = () => new Array(4)
      .fill('')
      .map((_, index) => genOrb(index));

    return () => (
      <div class={classList.value}>
        {genOrbs()}
      </div>
    );
  }
});
