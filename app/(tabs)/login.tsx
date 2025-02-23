import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import Container from "@/components/Container";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Redirect, useRouter } from "expo-router";
import { Link, LinkText } from "@/components/ui/link";
import { useQuery } from "@tanstack/react-query";
import { getLoginState, loginUser } from "@/services/asyncStorageServices";


function LoginAttempt(email:string|null|undefined, password:string|null|undefined) {
  if (!(typeof email === 'string' && typeof password === 'string')) { //TODO ask if there is a better method here
    console.log("returning false")
    return "false"
  }
  const { data: login_attempt } = useQuery({
    queryKey: [email, password],
    queryFn: async ({queryKey}) => {
      const [email, password] = queryKey
      console.log(email + " " + password)
      const state = await loginUser(email, password);
      return state;
    },
  })
  return login_attempt
}

export default function LoginScreen() {
  const router = useRouter();
  const { data: login_state } = useQuery({
    queryKey: ["logged-in"],
    queryFn: async () => {
      const state = await getLoginState();
      return state;
    },
  })

  return (
    
    <Container>
      {(login_state==="true") ? (
              <Redirect href={"/"}></Redirect>
            ) : (<> </>)} 

      <Card variant="ghost" className="p-10 mb-50">
          <VStack space="sm" className="mb-50">
            <Heading size="4xl">Sign In</Heading>
            <Text size="lg">Sign Into Your Kova Account</Text>
          </VStack>
      </Card>
      <Card variant="outline" className="m-[25px]">
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Email</Text>
          <Input className="ml-3 mr-5">
            <InputField id="email_input" placeholder="Enter Email" />
        </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Password</Text>
          <Input className="ml-3 mr-5">
            <InputField id="password_input" placeholder="Enter Password" />
        </Input>
        <Button variant="solid" size="xl" action="secondary" className="mt-5 mb-5 bg-[#6FA8DC]"
          onPress={() => router.replace("/")}
          > {/* TODO implement button routing and login features */}
          <ButtonText className="text-white">Sign In</ButtonText>
        </Button>
          <Link>  {/* TODO actually add this link to a new page */} 
            <LinkText>Forgot Password?</LinkText>
            {/* TODO ask abt LinkText error */}
          </Link>
        </VStack>
      </Card>
      <VStack space="sm">
        <Heading className="text-center">New To Kova?</Heading>
        <Button size="xl" className="ml-[38px] mr-[38px] bg-[#6FA8DC]"
        onPress={() => router.replace("/(tabs)/groups")}
        >
          <ButtonText className="text-white">Register for Account</ButtonText>
        </Button>
      </VStack>
    </Container>
  );
}
