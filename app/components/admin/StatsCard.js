"use client";

import { Card, CardBody, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

const StatsCard = ({ label, value, suffix = "" }) => {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber>
            {typeof value === "number" ? value.toFixed(1) : value}
            {suffix}
          </StatNumber>
        </Stat>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
