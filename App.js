import React, { useEffect, useState, useMemo } from "react";
import { Card, InputNumber, Table, Typography, Row, Col, Form } from "antd";
import "antd/dist/reset.css";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const { Title, Text } = Typography;

export const calculateAmountFromPercentage = (percentage, amount) => {
  if (!percentage || !amount) return 0;
  return parseFloat(((percentage / 100) * amount).toFixed(2));
};

export const config = {
  pfPercentageEmployee: 12,
  pfPercentageEmployer: 12,
  esicPercentageEmployee: 0.75,
  esicPercentageEmployer: 3.25,
  pfEmployeeLimit: 15000,
  esicEmployeeLimit: 21000,
};

const SalaryCalculation = () => {
  const [grossAmount, setGrossAmount] = useState(null);
  const [basicPercentage, setBasicPercentage] = useState(null);
  const [hraPercentage, setHraPercentage] = useState(null);
  const [otherPercentage, setOtherPercentage] = useState(null);

  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [otherAllowance, setOtherAllowance] = useState(0);

  const [pfEmployee, setPfEmployee] = useState({ amount: 0, percentage: 0 });
  const [pfEmployer, setPfEmployer] = useState({ amount: 0, percentage: 0 });
  const [esicEmployee, setEsicEmployee] = useState({
    amount: 0,
    percentage: 0,
  });
  const [esicEmployer, setEsicEmployer] = useState({
    amount: 0,
    percentage: 0,
  });

  const PF_LIMIT = config.pfEmployeeLimit;
  const PF_CAP_AMOUNT = 1800;
  const ESIC_LIMIT = config.esicEmployeeLimit;

  const grossMonthlyAmount = useMemo(
    () => basic + hra + otherAllowance,
    [basic, hra, otherAllowance]
  );

  useEffect(() => {
    if (!grossAmount) {
      setBasic(0);
      setHra(0);
      setOtherAllowance(0);
      return; // Stop further execution
    }

    if (grossAmount && basicPercentage && hraPercentage && otherPercentage) {
      const basicAmount = calculateAmountFromPercentage(
        basicPercentage,
        grossAmount
      );
      const hraAmount = calculateAmountFromPercentage(
        hraPercentage,
        basicAmount
      );
      const otherAmount = calculateAmountFromPercentage(
        otherPercentage,
        grossAmount
      );
      setBasic(basicAmount);
      setHra(hraAmount);
      setOtherAllowance(otherAmount);
    }
  }, [grossAmount, basicPercentage, hraPercentage, otherPercentage]);

  const calculatePF = () => {
    const earningsExceptHRA = basic + otherAllowance;

    const employeePF =
      earningsExceptHRA > PF_LIMIT
        ? PF_CAP_AMOUNT
        : calculateAmountFromPercentage(
            config.pfPercentageEmployee,
            earningsExceptHRA
          );
    const employerPF =
      earningsExceptHRA > PF_LIMIT
        ? PF_CAP_AMOUNT
        : calculateAmountFromPercentage(
            config.pfPercentageEmployer,
            earningsExceptHRA
          );

    setPfEmployee({
      amount: employeePF,
      percentage: config.pfPercentageEmployee,
    });
    setPfEmployer({
      amount: employerPF,
      percentage: config.pfPercentageEmployer,
    });
  };

  const calculateESIC = () => {
    if (grossMonthlyAmount > ESIC_LIMIT) {
      setEsicEmployee({ amount: 0, percentage: 0 });
      setEsicEmployer({ amount: 0, percentage: 0 });
      return;
    }

    setEsicEmployee({
      amount: calculateAmountFromPercentage(
        config.esicPercentageEmployee,
        grossMonthlyAmount
      ),
      percentage: config.esicPercentageEmployee,
    });
    setEsicEmployer({
      amount: calculateAmountFromPercentage(
        config.esicPercentageEmployer,
        grossMonthlyAmount
      ),
      percentage: config.esicPercentageEmployer,
    });
  };

  useEffect(() => {
    calculatePF();
    calculateESIC();
  }, [grossMonthlyAmount]);

  const totalDeductions = pfEmployee.amount + esicEmployee.amount;
  const totalEmployerContributions = pfEmployer.amount + esicEmployer.amount;
  const netPayment = grossMonthlyAmount - totalDeductions;

  const columns = [
    { title: "Description", dataIndex: "description" },
    { title: "Monthly Amount", dataIndex: "amount" },
    { title: "Yearly Amount", dataIndex: "yearlyAmount" },
  ];

  const dataSource = [
    {
      key: "1",
      description: "Basic Pay",
      amount: basic,
      yearlyAmount: basic * 12,
    },
    { key: "2", description: "HRA", amount: hra, yearlyAmount: hra * 12 },
    {
      key: "3",
      description: "Other Allowance",
      amount: otherAllowance,
      yearlyAmount: otherAllowance * 12,
    },
    {
      key: "4",
      description: "PF Employee",
      amount: pfEmployee.amount,
      yearlyAmount: pfEmployee.amount * 12,
    },
    {
      key: "5",
      description: "ESIC Employee",
      amount: esicEmployee.amount,
      yearlyAmount: esicEmployee.amount * 12,
    },
  ];

  const chartData = {
    labels: ["Basic", "HRA", "Other Allowance", "Deductions"],
    datasets: [
      {
        label: "Monthly Breakdown",
        data: [basic, hra, otherAllowance, totalDeductions],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        gap: "20px",
        marginTop: 20,
      }}
    >
      <div style={{ flex: 1, maxWidth: 400 }}>
        <Pie data={chartData} style={{ width: "100%" }} />
      </div>
      <Card
        title={<Title level={2}>Salary Calculation Breakup</Title>}
        bordered
        style={{ flex: 1, maxWidth: 900 }}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Gross Amount">
                <InputNumber
                  value={grossAmount}
                  onChange={setGrossAmount}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Basic %">
                <InputNumber
                  value={basicPercentage}
                  onChange={setBasicPercentage}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="HRA %">
                <InputNumber
                  value={hraPercentage}
                  onChange={setHraPercentage}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Other %">
                <InputNumber
                  value={otherPercentage}
                  onChange={setOtherPercentage}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          style={{ marginTop: 20 }}
        />
        <div style={{ margin: "15px" }}>
          <Text>Total Deductions: ₹{totalDeductions}</Text>
          <br />
          <Text>
            Total Employer Contributions: ₹{totalEmployerContributions}
          </Text>
          <br />
          <Title level={4}>Net Payment: ₹{netPayment}</Title>
        </div>
      </Card>
    </div>
  );
};

export default SalaryCalculation;
