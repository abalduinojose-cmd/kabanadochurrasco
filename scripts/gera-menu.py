"""
Gera src/data/menu.ts a partir do JSON público da loja no instadelivery
(https://app.instadelivery.com.br/api/stores/by-slug/kabanadochurrasco).

Uso:  python scripts/gera-menu.py caminho/para/instadelivery.json

Só nomes, descrições, preços e grupos de adicionais entram; foto nenhuma vem
de lá (as fotos são do Instagram da loja, em data/fotos.ts). Os ids são
slugs estáveis do nome, para fotos.ts e grupos-extra.ts apontarem para eles.
"""

import io
import json
import re
import sys
import unicodedata

CAMINHO = sys.argv[1]
SAIDA = 'src/data/menu.ts'

NOMES_CATEGORIA = {
    'Não Alcólicos': 'Não alcoólicos',
    'bomboniere': 'Bomboniere',
}

NOMES_ITEM = {
    'coca cola 350ml': 'Coca-Cola 350ml',
    'coca cola zero 350ml': 'Coca-Cola Zero 350ml',
    'guarana 350ml': 'Guaraná Antarctica 350ml',
    'guarana zero 350ml': 'Guaraná Antarctica Zero 350ml',
    'fanta laranja 350ml': 'Fanta Laranja 350ml',
    'fanta uva 350ml': 'Fanta Uva 350ml',
    'sprite zero 350ml': 'Sprite Zero 350ml',
    'schwepps tônica 350ml': 'Schweppes Tônica 350ml',
    'schwepps citrus 350ml': 'Schweppes Citrus 350ml',
    'del valle goiaba 290ml': 'Del Valle Goiaba 290ml',
    'del valle manga 290 ml': 'Del Valle Manga 290ml',
    'del valle pessego 290ml': 'Del Valle Pêssego 290ml',
    'del valle uva 290ml': 'Del Valle Uva 290ml',
    'H20': 'H2OH!',
    'coca cola zero 2L': 'Coca-Cola Zero 2L',
    'Coca-Cola KS Vidro': 'Coca-Cola KS Vidro 290ml',
    'coca cola KS vidro zero 290ml': 'Coca-Cola Zero KS Vidro 290ml',
    'Amestel 473ml': 'Amstel 473ml',
    'Malzebier Long Neck': 'Malzbier Long Neck',
    'Heineken 473ml Long': 'Heineken 473ml',
    'Heineken long neck zero': 'Heineken Zero Long Neck',
    'Cervejas sem Glúten Long Neck': 'Cerveja sem glúten Long Neck',
    "Jack Daniel' s": "Jack Daniel's",
    'kit kat': 'Kit Kat',
    'brownie': 'Brownie',
    'kinder joy': 'Kinder Joy',
    'mini bala fini': 'Mini bala Fini',
    'mentos': 'Mentos',
    'kinder bueno': 'Kinder Bueno',
}

NOMES_OPCAO = {
    'bacon': 'Bacon',
    'burguer costela': 'Burguer de costela extra',
    'burguer de frango': 'Burguer de frango extra',
    'burguer toscano': 'Burguer toscano extra',
    'burguer tradicional': 'Burguer tradicional extra',
    'cebola caramelizada': 'Cebola caramelizada',
    'maionese': 'Maionese Kabana',
    'queijo cheddar cremoso': 'Queijo cheddar cremoso',
    'queijo cheddar fatia': 'Queijo cheddar fatiado',
    'queijo mussarela': 'Queijo mussarela',
    'salada': 'Salada (alface e cebola roxa)',
}

DESCRICOES_GENERICAS = {'espetinho', 'espetinho especial', 'adicional'}

# Categorias inteiras de bebida alcoólica, além da marcação item a item.
CATEGORIAS_ALCOOL = {'Bebidas Quentes', 'Vinhos', 'Cervejas'}
SEM_ALCOOL = {'Heineken Zero Long Neck'}


def slug(texto: str) -> str:
    base = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()
    base = re.sub(r"[^a-zA-Z0-9]+", '-', base).strip('-').lower()
    return base


def limpa_descricao(d: str | None) -> str | None:
    if not d:
        return None
    t = re.sub(r"\s*\n\s*", ' ', d).strip()
    t = re.sub(r"\s+", ' ', t)
    t = t.replace(' ,', ',').replace('blend150g', 'blend 150g').replace('mineira150g', 'mineira 150g')
    if t.lower() in DESCRICOES_GENERICAS:
        return None
    return t


def ts_str(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def preco(v) -> str:
    return repr(round(float(v), 2)).rstrip('0').rstrip('.') if float(v) != int(float(v)) else str(int(float(v)))


dados = json.load(io.open(CAMINHO, encoding='utf-8'))

grupos_opcao: dict[str, dict] = {}
linhas: list[str] = []
ids_vistos: set[str] = set()

linhas.append('/**')
linhas.append(' * CARDÁPIO REAL da Kabana do Churrasco, gerado de instadelivery.com.br/kabanadochurrasco')
linhas.append(' * em 25/10/2026 por scripts/gera-menu.py. Preços em reais, como o dono digita; o app')
linhas.append(' * converte em centavos na entrada. Para atualizar: baixe o JSON de novo e rode o script.')
linhas.append(' * Fotos NÃO vêm daqui: ficam em data/fotos.ts, pelo id do item.')
linhas.append(' */')
linhas.append('')
linhas.append("import type { MenuCategoria, OptionGroup } from '@/types/menu';")
linhas.append('')

menu_linhas: list[str] = []
for g in dados['groups']:
    if g.get('is_invisible'):
        continue
    nome_cat = NOMES_CATEGORIA.get(g['name'].strip(), g['name'].strip())
    id_cat = slug(nome_cat)
    menu_linhas.append('  {')
    menu_linhas.append(f'    id: {ts_str(id_cat)},')
    menu_linhas.append(f'    nome: {ts_str(nome_cat)},')
    if g.get('description'):
        menu_linhas.append(f'    descricao: {ts_str(limpa_descricao(g["description"]))},')
    menu_linhas.append('    items: [')
    for it in g.get('itens', []):
        if it.get('is_invisible'):
            continue
        nome_bruto = it['name'].strip()
        nome = NOMES_ITEM.get(nome_bruto, nome_bruto)
        id_item = slug(nome)
        if id_item in ids_vistos:
            id_item = f'{id_item}-{id_cat}'
        ids_vistos.add(id_item)
        descricao = limpa_descricao(it.get('description'))
        badges: list[str] = []
        alcool = bool(it.get('is_alcohol')) or (g['name'].strip() in CATEGORIAS_ALCOOL and nome not in SEM_ALCOOL)
        if alcool:
            badges.append('alcoolico')
        if it.get('is_best_seller'):
            badges.append('mais-pedido')
        if it.get('is_newest'):
            badges.append('novidade')
        grupos_do_item: list[str] = []
        for c in it.get('complementos', []):
            opcoes = [o for o in c.get('complements', []) if not o.get('is_invisible')]
            if not opcoes:
                continue
            chave = slug(c['name']) + '-' + '-'.join(sorted(slug(o['name']) for o in opcoes))
            if chave not in grupos_opcao:
                unico = bool(c.get('only_one')) or int(c.get('max') or 0) == 1
                nome_grupo = 'Adicionais' if 'adicion' in c['name'].lower() else c['name'].strip().rstrip('?')
                grupos_opcao[chave] = {
                    'id': slug(nome_grupo) if slug(nome_grupo) not in {slug(v['id']) for v in grupos_opcao.values()} else slug(nome_grupo) + '-' + str(len(grupos_opcao) + 1),
                    'nome': nome_grupo,
                    'type': 'single' if unico else 'multiple',
                    'required': int(c.get('min') or 0) > 0,
                    'max': None if unico else int(c.get('max') or 0) or None,
                    'options': [
                        {
                            'id': slug(o['name']),
                            'nome': NOMES_OPCAO.get(o['name'].strip().lower(), o['name'].strip()),
                            'preco': float(o.get('price') or 0),
                        }
                        for o in opcoes
                    ],
                }
            grupos_do_item.append(grupos_opcao[chave]['id'])
        menu_linhas.append('      {')
        menu_linhas.append(f'        id: {ts_str(id_item)},')
        menu_linhas.append(f'        nome: {ts_str(nome)},')
        if descricao:
            menu_linhas.append(f'        descricao: {ts_str(descricao)},')
        menu_linhas.append(f'        preco: {preco(it["price1"])},')
        menu_linhas.append('        available: true,')
        if badges:
            menu_linhas.append('        badges: [' + ', '.join(ts_str(b) for b in badges) + '],')
        if grupos_do_item:
            menu_linhas.append('        optionGroups: [' + ', '.join(ts_str(x) for x in grupos_do_item) + '],')
        menu_linhas.append('      },')
    menu_linhas.append('    ],')
    menu_linhas.append('  },')

linhas.append('export const OPTION_GROUPS: readonly OptionGroup[] = [')
for gval in grupos_opcao.values():
    linhas.append('  {')
    linhas.append(f'    id: {ts_str(gval["id"])},')
    linhas.append(f'    nome: {ts_str(gval["nome"])},')
    linhas.append(f'    type: {ts_str(gval["type"])},')
    linhas.append(f'    required: {"true" if gval["required"] else "false"},')
    if gval['max']:
        linhas.append(f'    max: {gval["max"]},')
    linhas.append('    options: [')
    for o in gval['options']:
        linhas.append(f'      {{ id: {ts_str(o["id"])}, nome: {ts_str(o["nome"])}, preco: {preco(o["preco"])} }},')
    linhas.append('    ],')
    linhas.append('  },')
linhas.append('];')
linhas.append('')
linhas.append('export const MENU: readonly MenuCategoria[] = [')
linhas.extend(menu_linhas)
linhas.append('];')
linhas.append('')
linhas.append('/** Itens que existem no salão mas não saem para entrega (is_delivery = 0 no instadelivery). */')
excluidos = [slug(NOMES_ITEM.get(it['name'].strip(), it['name'].strip())) for g in dados['groups'] for it in g.get('itens', []) if it.get('is_delivery') == 0]
linhas.append('export const EXCLUIDOS_DO_DELIVERY: readonly string[] = [' + ', '.join(ts_str(x) for x in excluidos) + '];')
linhas.append('')

io.open(SAIDA, 'w', encoding='utf-8', newline='\n').write('\n'.join(linhas))

total = sum(len([i for i in g.get('itens', []) if not i.get('is_invisible')]) for g in dados['groups'] if not g.get('is_invisible'))
print(f'menu.ts: {len(dados["groups"])} categorias, {total} itens, {len(grupos_opcao)} grupos de opção')
print('categorias:', ', '.join(slug(NOMES_CATEGORIA.get(g["name"].strip(), g["name"].strip())) for g in dados['groups']))

# Taxas de entrega, para colar em loja.ts
fretes = []
for f in sorted(dados['fees'], key=lambda x: x['name'].strip().lower()):
    nome = re.sub(r"\s+", ' ', f['name'].strip())
    nome = nome[0].upper() + nome[1:]
    fretes.append(f"    {{ bairro: {ts_str(nome)}, taxa: {preco(f['price'])} }},")
io.open('scripts/fretes.gerado.txt', 'w', encoding='utf-8', newline='\n').write('\n'.join(fretes) + '\n')
print(f'fretes: {len(fretes)} zonas em scripts/fretes.gerado.txt')
