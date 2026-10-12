import { formatoPesos } from "./formato";

describe("formato (formatoPesos)", () => {
  it("separa los miles con punto y antepone el signo $", () => {
    expect(formatoPesos(45990)).toBe("$45.990");
    expect(formatoPesos(1234567)).toBe("$1.234.567");
  });

  it("no agrega separador en montos menores a 1.000", () => {
    expect(formatoPesos(990)).toBe("$990");
    expect(formatoPesos(0)).toBe("$0");
  });

  it("trata valores vacíos o inválidos como $0", () => {
    expect(formatoPesos(undefined)).toBe("$0");
    expect(formatoPesos("abc")).toBe("$0");
  });
});
