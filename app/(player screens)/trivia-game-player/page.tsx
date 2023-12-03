import React from "react";
// import GameTitle from "../../(games)/trivia-game/components/GameTitle";
// import JoinButton from "../../(games)/trivia-game/components/JoinButton";
import JoinButton from "./components/JoinButton";
import JoinForm from "./components/JoinForm";


import { cookies } from "next/headers";
import { createClient } from '@/utils/supabase/server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { redirect } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function JoinGamePage({ params }: Props) {

  const { id } = params

  const cookieStore = cookies()

  const supabase = createClient(cookieStore)

  const supabaseAuth = createServerComponentClient({ cookies })

  const { data: { session }} = await supabase.auth.getSession()


  if (!session) {
      return redirect('/unauthenticated')
  }

  const userId = session!.user.id


  return (
    <div className="flex flex-col justify-center text-center">
      <JoinForm />
    </div>
  );
};
