import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function RequireSeller({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        setUserType(data?.user_type || null);
        setLoading(false);
        if (data?.user_type !== "seller") {
          navigate("/");
        }
      } else {
        setUserType(null);
        setLoading(false);
        navigate("/auth");
      }
    };
    fetchProfile();
  }, [user, navigate]);

  if (loading || userType !== "seller") return null;
  return children;
} 