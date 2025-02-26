// Export the mod command as the default export for this module
import modCommand from "./mod";

// Export type for internal usage within the system
export type ModAction =
  | "ban"
  | "unban"
  | "kick"
  | "timeout"
  | "remove_timeout"
  | "warn"
  | "warnings";

// Export the mod command
export default modCommand;
