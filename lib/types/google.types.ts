// Centralized type definitions for Google Identity Services (GSI)

// Define CredentialResponse based on Google Identity Services documentation
// Includes properties potentially returned in the callback.
export interface CredentialResponse {
  credential?: string; // The ID token JWT string
  select_by?: 'auto' | 'manual' | 'user' | 'user_1tap' | 'user_2tap'; // How the credential was selected
  clientId?: string; // The client ID
  // Add other potential properties if needed based on Google's documentation
}

// Define the IdConfiguration interface based on Google Identity Services documentation
// Includes common configuration options for initializing the GSI client.
export interface IdConfiguration {
  client_id: string;
  callback?: (response: CredentialResponse) => void; // Callback function after sign-in/sign-up
  auto_select?: boolean; // Enable/disable automatic selection of the primary account
  login_uri?: string; // URI for server-side authentication
  native_callback?: () => void; // Callback for native apps
  cancel_on_tap_outside?: boolean; // Whether to cancel if user clicks outside the prompt
  prompt_parent_id?: string; // DOM ID of the container element for the prompt
  nonce?: string; // Nonce for replay protection
  context?: string; // Context for the sign-in request (e.g., 'signin', 'signup')
  state_cookie_domain?: string; // Domain for the state cookie
  ux_mode?: 'popup' | 'redirect'; // User experience mode
  allowed_parent_origin?: string | string[]; // Allowed parent origins for embedding
  intermediate_iframe_close_callback?: () => void; // Callback when intermediate iframe is closed
  itp_support?: boolean; // Intelligent Tracking Prevention support
  login_hint?: string; // Hint for the user's email address
  hd?: string; // Hosted domain restriction (e.g., 'example.com')
  use_fedcm_for_prompt?: boolean; // Use FedCM for the prompt (recommended)
}

// Extend the global Window interface
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          /** Initializes the Google Identity Services client. */
          initialize: (config: IdConfiguration) => void;
          /** Renders the One Tap prompt or button. */
          prompt: () => void;
          /** Disables automatic sign-in for One Tap. */
          disableAutoSelect: () => void;
          // Add other methods like 'renderButton', 'revoke', 'cancel' if needed
        };
      };
    };
  }
}

// Export empty object to ensure this file is treated as a module
export {};
