# -*- coding: utf-8 -*-
"""VetMap V22: recupera la distribución clásica del INICIO veterinario.

Uso: python aplicar_inicio_veterinaria_clasico_v22.py
Sólo edita el bloque React del inicio veterinario en web/src/main.jsx
 y crea web/src/vetmap_inicio_clasico_v22.css; no modifica index.css,
backend, base de datos ni otros roles. Crea backup verificable.
"""
import base64
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil
import zlib

STYLE_NAME = "vetmap_inicio_clasico_v22.css"
STYLE_IMPORT = 'import "./vetmap_inicio_clasico_v22.css";'
START = '              {currentUser.role === "vet" &&\n                memberSection === "inicio" && ('
END = '              {currentUser.role === "vet" &&\n                memberSection === "clinicAgenda" && ('
VET_HOME = zlib.decompress(base64.b85decode("c-rM!OK%%D5Wf3YFpD6N0<V-B?In@cFx*E9G=UMLxjNMDNMgKPZb_~aK@reXe?V_N=FnqLx#d{@lm3zpxeu)@?ZcAo7_Ck#E+4~hhV#t~myq&r?k7@0q<>Z*ds2izhQlFoE<iiv(W5<b<;Q`KK%RoHnTXP^EMh(rrZ?%V^(SPYvd(@;m3m1z44n(^`k@);22@Q)g35qk8!qZj1qU~lz*)jgn}o6HQ+jkwKimD_z_pVy-|;rAjGOB}CO=y72#x{CA}aCO4=+FBAn}wa5egDeEfkp%>SM<U6oL0lX~YCnk38-#Hcnl!EhEzuq^J-G#|7-7VvOsHcvd+Ohfcrp{{Hw}gmj<G$4n}1rs$Lv7-2(q@nF!$uGRCz-VdOR@RaC85eYc-f~tKIQ=i#=BO0d7Ag2Z+xk2Cn)VUV1JCZ=p9n$wm0AwsAr$jLxhtM1J<4O?vh{84qMM6UzLP|>!O}rB+#-PjwL$LDqy;w-Xsq%%USqn!aAc}@bKu4xqKO0;#drTvO7DU}C3j&CSj+P0^^UoiD;%I!i#eQ*MYDnJRb?xjtX39zB3F!#Jq4Nq<!XYXfd$l1_shN-GeSKoh!g`bq4(r44L`5U<-th*k;w>pXyRMJgi2^E}4Va>S>LE?-#LG24PyNZaxjQ-RDNVIH>}e6u*%^&v!6J>=XhjYW$&*E)?t$Vo482#`As|yR!*{l=-c0)$fcF>R1h=Ga5Zx21jeAf%)Z0W)*DyRO+=qk-x==|2q5dmiA|vRjKnD`TE|6BfU3#zism8-Q>8zP_+JL5QT{FV`;RA7;ZcoJ_(;a6YAIB`jqu=RdUAkoGWu6>*I4kdTyKCC370K%EH0J{3NX;&mO0C}OZEBm8o?SOaCxUR@g~JMke}1dpD%(p7e|2JdriTrQmtwf$v&&D>O`NtJD2Y=Rxf98PZD_~O!$5qd6GIJ7J)RYFV5mR?r`D{e2i}og!GLEyKDN{i7$sWcj`b|YwbDNh5z%qT{PW?wlbtjDq8uJ~oK(%}N=|p-y#@@WGS<U5v^t>p?f1-{2K{ugEl(PTzz^1JEs1@>(aH`pPe2Yg2JQ_=1CKREt1kta(iw^6<)`<ITmF=^L;zIv8YJwJr`xPwIwEd}Yt<^;<T<M_6e#o*>JU0l_Q}`X9;b1q!!&TK&`#})ORG4C*>G+~^;odDVk5PJZ(%|WB2_!PsYs+#aEq0;B*~d(911?k5&5ROX!2`K%f^_~sTm)Mu(g|w>ANkRY?Cl$n=z@9v-HRo5ES;zw6A&F^mRt0i=~s@PMrChOdjL)F#&rx&r&d>@>AP(Y&xe}N;`EIZx-Hqzn@ItzuK>zRLzdXp3Ux}?qoI`>_s#G?8Xvt7LeX1Pn3h&?CDn7A`h~2zQ6<q<E}fQij7geE%H3si6f3KKSw0Wh+<QYa7z@Cna4Hgq1gKxDP(h9ix*b)Z&@On#u7!Pz-zXGIfrRj3RsA<10m$-#8aV#(>xD?luK`ioCQ?V2D>Op!T5wI=?^zdvLH0n=oP=m1{07yEc#ey{APi!zr`X=R??!9GoOGy0sS2pZ&{8prdQ_RtM*)2<N8*j?A?epQ{NRHTS0D(#`3o#2@n{%zp_Ug0puQ!yhayAV`pc+%SFCm@Xn2;7~729IJYtLr}TeBSidBAs&`^5o4WXz{39vI%a1X$B^GRK*jrT;ZMjD|caZ$-Z56TE$!uVF!*#{{#JqwFrl=%o#<@H(z&FzEub&5f;I(kIFx1VEYNkW{dkP`gs|ZSxs31&ykd)vCRT65HS0!YMye3e_(A;SJg<y-VqKvy!OvqxJe6`ce^R?}LQSIDkWLs2vb5!%IAGr+0?t{@E7ls|8XDcqBjKPoDB(Y(li4Am8y4|2_TA8C-&^?MI(l0~+9Ve%o?z2rAOK|__oSrT2P*<%B$+^as)mKwz0edHR7aIFQHN=rXvG|Qt5mmxDmGyV32VQ<_R@70=C2)O?SHY&)dM*boncu*w^;4v`8aG$DZs&P76seC&rRb`QpW^bYRQ6k~L^nhyHv<P*{p+F)0bGNgrqER0Zv-g6e<^B+rP56Lxr8sw?YM@(=~lscR9GR&dVe86TSI4E?6r|Qk)V9ZVjF^1+m?^}R|GiI?4HBWhK6tFUbQLu-|;$5v7o}&f;*y71akF5gclGg`WB2!^%K-uVDtL?`->J|a2%Ua+(ZIN`i(~V%?5gDAI}0oi->94FE%RV#(YZZP0DJk?QDV;cYk$aR8+gKRV;530X1wi*htmadWqTc-oJ$O$gK")).decode("utf-8")
STYLE = zlib.decompress(base64.b85decode("c-rk-*><Bw8ou{aFzGYr*d5_!(|)GUsBOoVW6|A~m&kVo6bOkefELu#50hue-Q4zz&0hsbfRKcf%$doIE^Gr;{Pi#2zg6LPZ<!|?4v@z@2?FyE<{qmv5Bo?pzy0bk8n&3e+`s65Wac=;zUd&}bQ#t9_Df)@?)eGBFvD-ZS}uchtcHj=pWEzQ5Lneh0nA_`#zKsR4O1~KQ$rf1Xk+KwKj~G5D5Z5V95SY(VGlc+iJcI47{_INjBU?CD@4bZ=V}lzj>%YVz~CS>$zKgKZs@~>?^-xGXWqU$A*|TgR<O?oV{BQJHy`U73dWgBmIWq?Y<~e}V8Dh)rZep@Z@9LA8d7)jSg~fn+#8;6N?0e)H8TJnqYk53t~zD@V%nbThsX)ZpyDpsz+9P*0pqT(0Z;IVj4Vto9CsL=<NjKB$3{yw8FgF-Z;kqf>2w&b@Z3Y1Mwj6wZ^`g=_$6}itH2LZr-tv&91Uc^n%>a0!VJ~5T))H2k$<{T#2FdUT_<F9WSbTU+Xox@HRih^HeAd+_P?t!J>NuDjR}wwumM;XwDa|(sNlD?EvUThbQG++J}w<XIxNI|$tW_T$8Gw`EDT+T`9hfOn9dmZ2)pXc4?rl-H3`=xZ>9Gz-K7{vjjCHXr$Po<rs1$=i0z=GVoHvg%m9pf#Hz3+Jn94<QZcLGaDlPYWentX1TY1)k{g(z={g-BTPQT=xXak41M8Z`IP3tXU|MQo4s6Wx<Uwj%YEYpWlXB<S*DZI^8Jn6$)`|7f$pIq;osTqg7IgS_{B8yYmg!*Rvj&*~%%AdHUBgE04Q}a@t~1<UYj3m`MsQgd;9Ai&4Xz1n&&seqMjEh0a9d{mte!z#Uc`La*2s#b-rnK6L^ZJ|aEFXG=BeE>s%z)Lp8)#}*Ald5(RnDe0baNR#BJ|XfR}6HIX_?2M7YdJ$`FmMEq2ZeWwaLYaGT3p!@^-m!V&<4*pubY#e$0-5Yx*`St1`_7h4S}H?onAhJ`%4d1*>sOhl>YMLA?##|`n8Cw0j$Rx^D_8N}qk^2~O+B|cSjspK(HFOZ1wm4r~9SSasCJeTzvp6Hkt66ELop+P2QyumjVbSl*Awe;t_&7W<sgGIif5HcZNhAicK9R)J*=a?pORN}3apeWSZVvTPAIj(+IO?LrgHOGhpSz<gQLf%|ry<31=w*u|=fIkS4F^bsG^*SW%Br>*|lCFr|&9cJQvU}E;dS;L_yWyL;3`6eOkf!wzvoQby@O=-X@KmaS6(Rkday4G}&x!$t1X8|`(~7~eB1WNjC`mWzeK50uY(!^mgSZ5)lry5IY{Xil4Gcy6E^wg|V%}&xZegKY5|}eMe531nA*ON+#qk<cf>dh=HJ%dyR6^_QkhEa$jfb=e?$`c7nBz%S*-ZgzJ_mTI?HWhaq3N{RP9h!#NJX~dT3Zn5!WHDqoKiQQ9&1!0C`|;Q*W2za6tsw&x&Vq?hsGw>^+SqcSz3gG?-hiHA|z)Z3{^`?T1O&ZSGosG5c_nk66{j{&nSu(nCXg8nBs<-g?q+jn_FSN7$)*@gsXRpsfj@LAf^HvSyn}P$kY;XGEu0$i9(Xl5L(*KEX{N0g-n*0N2qrfV*nEs2Lp(FSbd)~HUb`Kta^R$+Qh7Lt_5L>SwA>$w=?$wDc@@6EfU(wA{#07_C&L6*a2|hP#y1+NJV}uOg1E~15zd&iMWZytwOQ2RVdPsv>lIxbv)v0^>(c-K{yikC%Lt<-{+al1SpZK?~O;~1(=JpO5u5bfu5$7ZlbJlTJU7;LAt7Z#7v6wO%PICXg%z#ZXwWPy<Uv#6;sqk#IbNNRl%H{m0=n%G?8nxcDqy~54SyKY|+<VEl}E|<;uBrlS6ddEo)}-cnp1LG(F^lLCd6VHJcdk2_U<rZPjzD<^##XN8YQ1jBBmT$|TW3>lT_SvXT;#<tu_crr8;j-jDf0i%<=#u8(Lr4O+oIG0q-Z5WGUtbtTFc=w?Bt{A*|}zO8o)Rp)Mc$fI4g4OU<+GYFY4`Lv#_LlV-a4zEORyGAGvzY;N}NEXNyj|`fHE;0I!a;=?IYpJ)Bc#|{~(A(x2&$@XYlDl2ML0o^UL(axnu6r2GnLfk9dW!CJU*n{bB4fDh%+el!XFaP><1}?8AFuXw7w*i@;hcoeV%3p4ry{nR``U<XrI==fje+Q8Az$&8QR*NYA5sRLRDg0ej}ia@nzzhTor6QQV2+VYEm++3$yS5)qT3eLUlPiw1Z$$$vP>^9gNn#XxZ7I<<^@?7foZrATRduK_$F>ylyL`-uM5mUh{9Rio929*+rm=2UDAvRS}WDH(yD7bm(M5dg0>-t{3ia+RTsh=4zZT^MBL6cGD4%-R8Y49F-JFjdyAN)x3RYFiW*I&Uavq5IV$MBNG#t6AuOu(eVY&|91i6QDM=WINxdphl%$A~{E$@SWhtVV7cwbhSIJU6Mg0E!aB@&x9e5nF>e#fjT9xFnnNBw0v!Za-5<_ZnZ|sI{rN%#r^36@VPp=DJTD}Wja2iS1i(6SI6<K|6+7NOx_Dw5Za_uS;tcI*^h8>l#(9JisyO)@oc)@zUtEXE_DWFLC-71wbClaC}t&3cM5dTL<qI^M6&Ult5t%adV*q8h0=1@>@cj95KY*WP_cKL+T`%D8-!ShMIQ1E=x!BzKsDa$7@RJ+vkv%bw?Rd1E-Q1K=Ed}$ySM5WnyjZ5d%QCh)qP{ZjdsL~+a);PUh!C)nO(0mEJHVvlG&?=C{HuEKI$pdWZ9qedXFI}$@gpsx0y-D|{71UN62Unq+cB%V{VkVS`rB1e+UL5Uy_vVmr&eyY>K|;J4)Y!8b^vWHdbSq%p-0_=CD(w|9yNQt9fs*n~@<9TujYHp5w><qdd;T;oG^?<?y{*l2xm_AA@zgZZRHV4I?OOt(X5Ni6+4=A$Ity6B7{HnOJ%?~RUk79(eqC?r((BBS+d$4Z)~oHA-MP)Bm}+EH&<Lv_$01><+F9U^gTL)l;;h*l{ElK^drx!U$+y7KlWz?{?AFtx?z8O274%4t(%E#f0yz<^rh`l$x9`}yuvt_%@@s9ib%$0TgP36oV{){e!kAuXHsD*?4fvL#qC>Xz&?0k!j}*v$vk-Ta0#P8ROnzdbb;fK98wTigx*~3C7}6hcB^^S3$9JLez^5$V0<)ZTU2-xJMxFEa0T<gupST!H<j%M+z1|=p$&2dDCk}i;Za^!+H2ER`w2e$Bei8>QNJ+_6{B*5>1g&5kWom}(Hj&)O7O~uDk!S@|<h8Iv-Ic&nMrjK<Ur+uHy`_mxH(xA)4{_vs2?Fs7XDxd(gRti``0F0}KhI2cn$V6(cKCNJzxSPWiTWyz_L9ui4drBkNM5KCjW$~c6-o}>Yn4;;zeVQ<ZMr4utL#S`^?mQeA8uuH0%`X*r9ceV1Mib>h%(u-RZMfcU)OLjg#gMbK1S0`{GsO>rB;>NIjjEW&lPjEPDN&41DD!wbeLC|JM+0vL2nH6>I$$K7rI|h-o0Ia(aMnE>!Scx*nEVFmu5f;3@C3*=1JgTX!7mX_|sB{Y)J%+_w5(x<=pa*O5uLYHxi4zXB;%o%z!&;E*Qu>g@tGEBx%+_;?r}Y#W_A(mx4k|YBzJmUYhmz?TYJ<WGCTd%}C*xat9ZC(=ZG9#DdNaLG8!nGMi~519xV=b^4u#Le!!6?}EAU{nEA|F9*0G)jr+G!b|i)Ql6JHb;X(J=AKh8-T9rUiCR<_2T^^l+Uk5T=`98q?UiP$X8%U>UT*H)Ps4sBU-S)h{p7s}V=ledY|GNP+d01E%)v!((ZB3-^vC>QqvvJtX?QzRgt`UyEA8fXj)cc{-@Xk-&$6F+7HWbu)vk?pf6|9FWlpu*{>zXL&~x1y2|p}=PNaxWvlm!X74IWO2(7#4rKi|WKP!SY%Zz{j>E_lNiJuM1Q`9%`17}iR*K1r!u(td1Y&q!Wb9x`q`DTCqX|i05e!6%2*DyBa#Qx>2AYXAyIqF5)<X#>`z2)HASbn_Xr2gd<hc2YW;E`Jn%-&MIHfDp%ALPNq$QV4_yLXe`^5MaN>v3{@6~Q|aeP>A4TFh1P#rb6X?Qh?mk#Db#*8JbG=0Sg+1=tUc&b-(BAI3n-cmbY3-2(8l)J!fKJ$yD~%45$MTyWgo!+l@2uYljrM$CIJgmF#-9`06BYb03FNLX6^Ygqz$>%i}XLJ1(HPAH^`P>BEn(cq_1I4IB^MBM6bVu&$6gW2Fg9+S0VUV2ONSB@l6K05gSp@k1RJyc2I*bP+I!$;Sz3=D|C;)ox?U)fAS(IZiM@idWTc(xi|-iHGK4Mg)OiOc|w+p#?C@yUF6?+SiC2zL)xWuS=$z}HBek}MLDEJB|3&DQsyVm*F;bm2dfr4HBA^dHQQPPoUk*RrSDa_};QXiE5c0Giiw9e4(l#*y{oa4WJBbBo&KDS)VXbfEu;mMehY^c0tVCwz2(O8p0<`?CInJJ5ebFV8a9zaev{z|S<{Ypn|*|NdtfyCpGhNlluItyAbdZe7{tLWrXrx*XBicqf7_R?@M+{GYJkVaFZgW7hiJ@pSOeqpDZ0e}Ja{!xY{R<%kw4E2#OQzURba=K4=*`k)iUUril-plV+Y{M?fM8H(-xrq4CWCfJoQdVpt}Vjbq(x)7$uWPDSQ_rrlTk}%XAq~6dbFRnbLn`SF?IhH>{kuM8|bo7}&i)9Y_82uRG&*NgIa{a>uMI<Oa1<JLxP=!b65sA?rXCxTK{i2a(=jd*7MXpJ(THR5@-bbV7`s&4QM+#I4U}O%;ZR^Ji4*Ja=4|9x<7gHL{USLi1(}&e2@bxlle4c$IKyWBv=yTN}&j<U~5J}HV){rkG>BqR-x0LIpr{2hE-@BBD61U#kim#JOMWTH$c~17p0k~tuk!?l14P)@#1Lz(BJOHSN$C*s!`Rq|pZ0W1Npt^|zc|F!mtg}jMOdbue?QAgYk$1iADv0*{%TdIE4F+U;k8HOA&?WBff!L}??n8Kg3H|?U5cSBskj{x<&O|i^LkW^cpNuUjjYuN;BhQz2Ln)$TCP(Cicc<{~{R+nF@!Z}_ejdPkkK}z~d%`RHRYO7-^b)3Y?jFb*9LxnLi=@@()s;Z`co@uNaz=0=2}Bn7p)x(2f5J`Qqvsqw=fBc(4yLH&OT1$pSh3n5@HB{<KxF|?9ug=&Zq8F8395z<0|Iq$5mC7y=DVUM-92BOeY{#M=~>G2LL%_{SWch7RlJ*w8{4oRkh#l&ZSV@IW+KuVi~!agR4|XnO^*LdD}O!t7j8u7aR")).decode("utf-8")


def project_root():
    for loc in [Path.cwd(), Path(__file__).resolve().parent]:
        for folder in [loc, *loc.parents]:
            if (folder / "web/src/main.jsx").is_file() and (folder / "web/src/index.css").is_file():
                return folder
    raise SystemExit("ERROR: no encontré ProyectoVetMap/web/src/main.jsx. Ejecuta este script dentro de ProyectoVetMap.")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    root = project_root()
    target = root / "web/src/main.jsx"
    css_path = root / "web/src" / STYLE_NAME
    raw = target.read_bytes()
    bom = raw.startswith(b"\xef\xbb\xbf")
    original = raw.decode("utf-8-sig")
    newline = "\r\n" if b"\r\n" in raw else "\n"
    code = original.replace("\r\n", "\n")

    if "vm-v22-classic" in code or STYLE_IMPORT in code:
        if "vm-v22-classic" in code and STYLE_IMPORT in code and css_path.is_file() and css_path.read_text(encoding="utf-8") == STYLE:
            print("V22 ya está instalado. No modifiqué nada.")
            return
        raise SystemExit("ERROR: detecté una instalación V22 incompleta o modificada. No sobrescribí nada. Revisa el respaldo antes de continuar.")

    if css_path.exists():
        raise SystemExit("ERROR: ya existe un archivo de estilo con el mismo nombre. No sobrescribí nada.")
    if code.count(START) != 1 or code.count(END) != 1:
        raise SystemExit("ERROR: no pude identificar de forma única el inicio veterinario V18/V19/V20/V21. No modifiqué nada.")
    start = code.index(START)
    end = code.index(END, start)
    section = code[start:end]
    if "vm-refdash--vet" not in section or "clinicPatients" not in section:
        raise SystemExit("ERROR: esta estructura del inicio veterinario no es compatible. No modifiqué nada.")

    # Comprobar que los datos y acciones usados realmente existen en el proyecto.
    needed = ["clinicDashboard", "clinicPatients", "clinicAppointments", "clinicPrescriptions", "getPetEmoji", "openClinicPatient", "reservationStatusClass", "reservationStatusLabel", "setAccountMode"]
    missing = [key for key in needed if key not in code]
    if missing:
        raise SystemExit("ERROR: faltan referencias: " + ", ".join(missing) + ". No modifiqué nada.")

    updated = code[:start] + VET_HOME + code[end:]
    # Importar DESPUÉS de los estilos existentes, incluso si está activo V21.
    css_imports = list(re.finditer(r'^import\s+[\"\'][^\"\']+\.css[\"\'];?[ \t]*$', updated, re.M))
    if not css_imports:
        raise SystemExit("ERROR: no encontré importaciones CSS en main.jsx. No modifiqué nada.")
    last = css_imports[-1]
    updated = updated[:last.end()] + "\n" + STYLE_IMPORT + updated[last.end():]
    updated = updated.replace("\n", newline)
    out = (b"\xef\xbb\xbf" if bom else b"") + updated.encode("utf-8")

    backups_root = root / "respaldos_instaladores"
    backups_root.mkdir(exist_ok=True)
    backup = backups_root / ("antes_inicio_v22_" + datetime.now().strftime("%Y%m%d_%H%M%S_%f"))
    backup.mkdir()
    shutil.copy2(target, backup / "main.jsx")
    # index.css: una copia extra por seguridad, pero NO lo modificamos.
    shutil.copy2(root / "web/src/index.css", backup / "index.css")
    manifest = {
        "relative_main": "web/src/main.jsx",
        "relative_css": "web/src/" + STYLE_NAME,
        "main_before_sha256": digest(raw),
        "main_after_sha256": digest(out),
        "css_after_sha256": digest(STYLE.encode("utf-8")),
        "css_existed": False,
        "index_css_modified": False,
    }
    (backup / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    try:
        tmp_main = target.with_name(".main_v22_temp.jsx")
        tmp_css = css_path.with_name(".vetmap_inicio_v22_temp.css")
        tmp_main.write_bytes(out)
        tmp_css.write_text(STYLE, encoding="utf-8")
        tmp_main.replace(target)
        tmp_css.replace(css_path)
    except Exception:
        shutil.copy2(backup / "main.jsx", target)
        if css_path.is_file() and digest(css_path.read_bytes()) == manifest["css_after_sha256"]:
            css_path.unlink()
        (target.parent / ".main_v22_temp.jsx").unlink(missing_ok=True)
        (target.parent / ".vetmap_inicio_v22_temp.css").unlink(missing_ok=True)
        raise

    print("\nVETMAP V22: INICIO VETERINARIO CLÁSICO APLICADO")
    print("Ruta:", root)
    print("Respaldo:", backup)
    print("Modificados: web/src/main.jsx + CSS independiente " + STYLE_NAME)
    print("NO se tocó index.css ni otros roles, ni backend, base de datos o datos de mascotas.")
    print("Recarga VetMap con Ctrl + F5 y abre Veterinaria > Inicio.")


if __name__ == "__main__":
    main()
