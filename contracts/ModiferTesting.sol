contract ModiferTesting {
   uint public a;
   uint public b;
   uint public c;

   modifier modA() {
    a = a + 1;
    _;
   }

   modifier modB() {
    b = b + 1;
    _;
    b = b + 1;
    _;
    b = b + 1;
    _;
  }

   modifier modC() {
    a = a + 1;
    _; // 3
    a = a + 1;
    _; // 6
    a = a + 1;
    _;
    a = a + 1;
    _;
  }

  function test() public modA modB {
    c = c + 1;
  }
}