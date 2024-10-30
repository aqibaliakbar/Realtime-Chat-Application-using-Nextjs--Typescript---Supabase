import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, TypingStatus } from "@/types";

export const useTypingIndicator = (currentUser: User) => {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const channelRef = useRef<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const initializeChannel = async () => {
      try {
        // Initialize the channel
        const channel = supabase.channel(`room:typing`, {
          config: {
            presence: {
              key: currentUser.id,
            },
          },
        });

        // Handle presence states
        channel
          .on("presence", { event: "sync" }, () => {
            const newState = channel.presenceState();
            const currentTypingUsers = Object.values(newState)
              .flat()
              .filter(
                (status: any) =>
                  status.user_id !== currentUser.id && status.is_typing
              ) as TypingStatus[];

            setTypingUsers(currentTypingUsers);
          })
          .on("presence", { event: "join" }, ({ key, newPresence }: any) => {
            console.log("User joined:", key, newPresence);
          })
          .on("presence", { event: "leave" }, ({ key, leftPresence }: any) => {
            console.log("User left:", key, leftPresence);
          });

        // Subscribe to the channel
        const status = await channel.subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to typing channel");
            channelRef.current = channel;
            setIsSubscribed(true);

            // Set initial presence
            await channel.track({
              user_id: currentUser.id,
              username: currentUser.username,
              is_typing: false,
            });
          }
        });

        return () => {
          if (channelRef.current) {
            channelRef.current.unsubscribe();
            setIsSubscribed(false);
          }
        };
      } catch (error) {
        console.error("Error initializing typing channel:", error);
      }
    };

    initializeChannel();
  }, [currentUser]);

  const setTypingStatus = useCallback(
    async (isTyping: boolean) => {
      try {
        if (!isSubscribed || !channelRef.current) {
          console.log("Channel not ready yet");
          return;
        }

        await channelRef.current.track({
          user_id: currentUser.id,
          username: currentUser.username,
          is_typing: isTyping,
        });
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    [currentUser, isSubscribed]
  );

  // Debounced version of setTypingStatus
  const debouncedSetTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (isTyping) {
        setTypingStatus(true);
        // Automatically set to false after 3 seconds
        setTimeout(() => {
          setTypingStatus(false);
        }, 3000);
      } else {
        setTypingStatus(false);
      }
    },
    [setTypingStatus]
  );

  return {
    typingUsers,
    setTypingStatus: debouncedSetTypingStatus,
    isSubscribed,
  };
};
