import { defineComponent } from 'vue';
import { VBtn, VSpacer } from 'vuetify/components';

export const AccountImportSuccess = defineComponent({
  emits: [
    'click:next',
    'click:oauth'
  ],

  props: {
    hasPortal: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    return () => (
      <>
        <div class="text-h3 mb-6">
          Recovered successfully
        </div>

        <div class="text-body-large mb-12">
          <p>
            Welcome back to your account
          </p>
        </div>

        <div class="d-flex mt-12">
          <VSpacer/>

          {props.hasPortal ? (
            <>
              <VBtn
                color="secondary-btn"
                class="ml-4"
                onClick={() => emit('click:next')}
              >
                Go to wallet
              </VBtn>
              <VBtn
                class="ml-4"
                onClick={() => emit('click:oauth')}
              >
                Back to oauth
              </VBtn>
            </>
          ) : (
            <VBtn
              class="ml-4"
              onClick={() => emit('click:next')}
            >
              Go to wallet
            </VBtn>
          )}
        </div>
      </>
    );
  }
});
