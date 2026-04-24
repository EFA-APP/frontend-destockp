import sys
path = r'j:\GITHUB\efa\backend\launcher-efa\microservices\frontend\src\Componentes\Secciones\Ventas\Comprobantes\PanelPago.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

header_forma_pago = """        {/* 4. FORMA DE PAGO */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center gap-2">
              <DineroIcono size={14} /> 4. Forma de Pago
            </label>
            {listaPagos.length > 0 && (
              <span className="text-[12px] font-black text-emerald-500">
                $
                {listaPagos
                  .reduce((acc, p) => acc + p.monto, 0)
                  .toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            )}
          </div>"""

new_lines = []
new_lines.extend(lines[:240])
new_lines.extend(lines[553:694])
new_lines.extend(header_forma_pago.split('\n'))
new_lines.extend(lines[266:552])
new_lines.extend(lines[695:])

with open(path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines) + '\n')
print('Fixed PanelPago.jsx')
