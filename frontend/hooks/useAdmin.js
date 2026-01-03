import { useState, useEffect } from 'react';
import useAuth from './useAuth';

function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
      setAdminLoading(false);
    } else {
      setIsAdmin(false);
      setAdminLoading(false);
    }
  }, [user]);

  return { isAdmin, adminLoading };
}

export default useAdmin;
