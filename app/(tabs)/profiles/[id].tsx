// just writing this already so I stop getting errors

import Container from "@/components/Container";
import { useLocalSearchParams } from "expo-router";

export default function Profile() {
  const { id } = useLocalSearchParams()
  
  return (
    <Container>
      
    </Container>
  )
}