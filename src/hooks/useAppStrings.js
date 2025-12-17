import { useStrings } from '../services/StringsService/StringsProvider';

/**
 * Custom hook to get app strings
 * Usage: const { getString } = useAppStrings();
 *        const homeText = getString('navigation.home');
 */
export const useAppStrings = () => {
  const { getString, strings, loading, error, refreshStrings } = useStrings();
  
  return {
    getString,
    strings,
    loading,
    error,
    refreshStrings,
  };
};

export default useAppStrings;

