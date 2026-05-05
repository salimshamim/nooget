"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../card";

interface CardWrapperProps {
  children: React.ReactNode;
  cardDescription?: string;
  pending?: boolean;
}

const DEFAULT_CARD_DESCRIPTION = "by 3CLogic";

function CardWrapper({ children, cardDescription = DEFAULT_CARD_DESCRIPTION }: CardWrapperProps) {
  return (
    <Card className="w-full bg-transparent md:bg-white md:w-[400px] md:shadow-md space-x-4 space-y-6 shadow-none border-none drop-shadow-none rounded-none ">
      <CardHeader className="items-center">
        <CardTitle>CDR Viewer</CardTitle>
        {<CardDescription>{cardDescription}</CardDescription>}
      </CardHeader>
      <CardContent className="items-center">{children}</CardContent>
    </Card>
  );
}

export default CardWrapper;
