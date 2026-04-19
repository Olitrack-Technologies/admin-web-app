import { useEffect, useRef, useState } from "react"
import * as ReactLeaflet from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import {
  IconAntennaBars5,
  IconBatteryVertical3,
  IconBrandSpeedtest,
  IconGasStation,
  IconRoad,
} from "@tabler/icons-react"
import { Code, Divider } from "@mantine/core"

import L from "leaflet"
import moment from "moment"

const { MapContainer } = ReactLeaflet

const MapCenterUpdater = ({ position }) => {
  const map = ReactLeaflet.useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])

  return null
}

const Map = ({ devices }) => {
  const defaultCenter = devices[0]?.position // fallback to Nairobi

  const colorMap = {
    red: {
      bgLight: "bg-red-100",
      bgDot: "bg-red-500",
      text: "text-red-700",
    },
    green: {
      bgLight: "bg-green-100",
      bgDot: "bg-green-500",
      text: "text-green-700",
    },
    yellow: {
      bgLight: "bg-yellow-100",
      bgDot: "bg-yellow-500",
      text: "text-yellow-700",
    },
    blue: {
      bgLight: "bg-blue-100",
      bgDot: "bg-blue-500",
      text: "text-blue-700",
    },
    gray: {
      bgLight: "bg-gray-100",
      bgDot: "bg-gray-500",
      text: "text-gray-700",
    },
  }

  const StatusBadge = ({ label, color = "red" }) => {
    const selectedColor = colorMap[color] || colorMap.red
    return (
      <div
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${selectedColor.bgLight} ${selectedColor.text}`}
      >
        <span className={`w-1 h-1 rounded-full ${selectedColor.bgDot}`} />
        <span className="text-[0.5rem]">{label}</span>
      </div>
    )
  }

  const PopupContent = ({ device }) => {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
      const checkStatus = () => {
        const timestampMs = parseInt(device.timestamp)
        const online = Date.now() - timestampMs < 30000 // 1 min 15 sec
        setIsOnline(online)
      }

      // Check immediately on mount
      checkStatus()

      // Recheck every 15 seconds
      const interval = setInterval(checkStatus, 5000)

      // Cleanup
      return () => clearInterval(interval)
    }, [device.timestamp])

    return (
      <div className="">
        {/* 1 */}
        <div className="py-2 space-y-2 w-full">
          <div className="flex justify-between items-center">
            <strong className="text-[1.2rem]">
              {device?.vehicle?.registrationNumber}
            </strong>

            <div className="flex space-x-2">
              <div className="flex items-center">
                <IconAntennaBars5 size={16} />
                <span className="text-[0.7rem]">Excellent</span>
              </div>

              <div className="flex items-center">
                <IconBatteryVertical3 size={16} />
                <span className="text-[0.7rem]">100%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">
              <Code>{device?.vehicle?.deviceType}</Code> |{" "}
              {device?.vehicle?.deviceSerialNumber} ({" "}
              {device?.vehicle?.deviceSIM} )
            </span>
            <StatusBadge
              color={isOnline ? "green" : "red"}
              label={isOnline ? "Online" : "Offline"}
            />
          </div>

          {!isOnline && (
            <p className="p-0">
              Last online :{" "}
              {moment(new Date(parseInt(device.timestamp))).format(
                "Do MMM YYYY | hh:mm A"
              )}
            </p>
          )}
        </div>

        <Divider />

        {/* 2 */}

        <div className="py-2 space-y-2 flex justify-between w-full">
          <div className="flex space-x-2 items-center">
            <IconRoad stroke={1} />
            <div>
              <span className="block text-gray-500 text-[0.6rem] ">Today</span>
              <strong className="text-[1rem]">
                {device?.vehicle?.distanceToday} KM
              </strong>
            </div>
          </div>

          <div className="flex space-x-2 items-center">
            <IconBrandSpeedtest stroke={1} />
            <div>
              <span className="block text-gray-500 text-[0.6rem] ">Speed</span>
              <strong className="text-[1rem]">{device?.speed} KM/H</strong>
            </div>
          </div>

          <div className="flex space-x-2 items-center">
            <IconGasStation stroke={1} />
            <div>
              <span className="block text-gray-500 text-[0.6rem] ">Fuel</span>
              <strong className="text-[1rem]">{device?.fuel} L</strong>
            </div>
          </div>
        </div>

        {/* <Divider /> */}

        {/* 3 */}

        {/* <div>
          <div className="flex justify-between items-center ">
            <p>
              Available airtime : <strong>Ksh. 45.06</strong>
            </p>

            <Button size="xs" variant="transparent">
              Top up
            </Button>
          </div>
        </div> */}
      </div>
    )
  }

  const GreenPingingIcon = L.divIcon({
    className: "",
    html: `
    <svg width="19.84" height="43.16" viewBox="0 0 496 1079" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M35.6678 545.028C34.3592 538.345 33.4413 529.044 34.6952 521.271C36.7303 508.646 39.9452 503.943 39.8553 497.775C39.7772 492.466 42.5272 400.884 43.2889 375.583C43.535 367.497 45.1522 368.689 37.9178 370.771C27.3202 373.818 5.06235 380.075 2.42954 379.689C-1.04311 379.177 -0.422022 358.794 9.60142 352.739C17.2499 348.118 34.5624 344.157 42.3397 341.56C48.2381 339.587 46.3124 338.196 46.5702 331.208C47.3319 310.552 49.0624 256.849 46.6991 227.81C43.7772 191.896 42.2538 143.196 53.867 107.767C71.9686 52.5245 112.308 20.9152 165.93 6.77454C199.305 -2.02625 295.238 -0.756714 324.961 5.48547C363.937 13.6652 412.738 38.3331 432.547 74.7355C443.683 95.1847 452.496 120.564 453.648 146.474C455.168 180.63 449.945 252.962 449.648 279.829C449.422 300.482 449.68 327.818 450.742 339.802C451.383 347.036 450.871 345.618 457.359 347.259C467.316 349.771 487.547 355.622 491.207 367.142C495.941 382.052 496.226 384.743 492.285 383.751C489.652 383.087 471.805 377.665 460.348 375.372C447.945 372.892 450.676 373.931 450.855 385.31C451.273 411.575 452.129 481.064 452.855 502.294C453.09 509.243 453.637 509.181 455.555 515.786C457.207 521.47 459.082 529.29 459.16 535.599C459.234 541.806 457.066 547.583 455.101 551.97C452.301 558.216 452.109 557.29 451.828 564.083C450.586 594.177 448.273 735.107 449.027 737.966C449.859 741.134 454.871 759.763 452.695 770.962C450.515 782.161 447.816 783.157 447.551 792.954C447.469 795.954 449.539 829.415 446.351 859.146C444.644 875.068 438.461 881.888 436.254 900.349C431.004 944.239 424.715 990.134 419.094 1014.13C413.937 1036.17 401.14 1046.42 379.094 1052.69C370.883 1055.03 356.418 1063.08 335.344 1069.36C293.164 1081.93 189.851 1079.97 149.25 1068.97C113.953 1059.42 106.465 1050.33 100.945 1049.32C95.4217 1048.31 69.6561 1034.11 66.8983 1026.26C64.1366 1018.41 46.3631 910.099 43.7303 876.72C42.7459 864.275 40.1092 848.993 39.4256 832.568C38.2772 804.946 39.2967 776.943 38.5311 774.556C37.3084 770.751 35.0545 759.818 35.6717 747.025C36.1874 736.318 39.7772 731.935 39.7225 723.044C39.5663 697.571 38.7889 588.38 38.3202 560.153C38.1874 552.134 37.1444 552.556 35.6678 545.028Z" fill="#34AA2D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M64.4377 757.567C66.7932 759.329 70.3674 761.794 74.0549 763.575C75.8518 764.442 77.2112 765.091 78.2385 765.575C82.7385 767.7 81.3557 766.38 80.8948 772.915C79.8284 788.044 76.6409 826.841 71.9299 827.169C66.0784 827.579 64.5979 816.157 63.9065 802.267C63.3792 791.728 62.2502 770.372 61.8167 760.54C61.5354 754.169 60.6174 754.708 64.4377 757.567Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M61.4113 734.672C61.4465 718.547 58.9816 616.407 58.4816 595.891C58.3722 591.356 57.5207 591.95 61.1965 593.586C64.7629 595.172 71.2316 597.918 77.673 599.946C80.5207 600.844 82.6496 601.473 84.2355 601.91C89.8644 603.461 88.7472 601.418 88.5832 607.289C88.0285 627.305 85.6574 710.246 83.9465 733.657C82.8996 747.946 82.2707 755.379 81.9074 759.2C81.4113 764.469 82.3957 763.739 76.4113 760.633C70.4504 757.539 61.3762 752.172 61.4191 748.188C61.4855 742.262 61.4113 734.672 61.4113 734.672Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M59.2262 516.683C59.3277 507.429 62.7769 405.976 63.8199 375.456C64.0621 368.351 62.8941 361.94 68.5387 372.78C72.0816 379.585 77.0387 393.839 80.6441 423.19C86.8785 473.995 87.8316 502.3 88.6793 525.702C89.2691 541.933 89.1207 559.487 88.9762 568.722C88.8434 577.104 90.4762 576.257 82.1871 571.925C73.3004 567.284 58.6793 558.862 58.734 553.745C58.816 546.397 59.2262 516.683 59.2262 516.683Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M100.473 429.41C95.9181 400.473 76.6135 300.457 84.547 298.223C152.043 279.18 166.934 271.77 238.195 273.77C312.973 275.864 415.516 286.196 415.906 306.614C416.074 315.582 400.754 400.965 392.492 430.684C389.242 442.367 390.785 441.367 381.043 439.367C361.758 435.406 308.762 424.828 255.438 424.5C205.059 424.196 156.125 427.797 106.395 435.117C99.5549 436.125 101.711 437.278 100.473 429.41Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M130.37 543.254C130.702 513.094 155.651 488.688 185.815 489.02L309.718 490.387C339.882 490.719 364.288 515.669 363.956 545.829C363.624 575.993 338.671 600.399 308.511 600.067L184.604 598.7C154.444 598.368 130.038 573.419 130.37 543.254Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M112.336 828.726C126.379 831.804 156.457 838.191 188.661 841.855C233.434 846.953 289.575 845 333.86 838.222C346.614 836.269 358.961 833.808 367.473 831.992C381.559 828.988 378.661 826.215 379.145 839.879C380.286 871.953 383.403 967.222 380.235 968.5C315.586 994.601 269.215 992.953 202.747 986.382C154.872 981.652 99.3403 973.226 99.2817 961.613C99.2114 948.855 102.832 856.011 103.993 832.433C104.36 824.922 103.274 826.742 112.336 828.726Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M400.497 542.285C400.744 519.683 409.079 444.695 412.134 425.449C414.337 411.57 418.779 392.292 421.654 382.031C423.372 375.898 428.732 365.777 429.236 379.718C429.552 388.499 430.384 520.566 430.587 553.538C430.642 561.999 432.294 559.824 426.068 564.273C417.892 570.105 401.482 581.288 400.095 578.081C398.247 573.792 400.497 542.285 400.497 542.285Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M401.226 733.622C400.746 717.153 399.332 638.161 399.644 613.177C399.742 605.341 398.285 606.118 404.003 604.454C409.218 602.935 418.3 600.302 423.812 599.216C429.617 598.075 428.507 598.353 428.367 603.536C427.746 626.189 424.543 728.255 423.199 750.458C422.91 755.235 423.605 754.392 419.722 756.966C414.312 760.56 403.718 766.724 403.027 763.755C402.121 759.872 401.226 733.622 401.226 733.622Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M406.367 769.636C408.113 768.945 421.801 760.168 422.019 761.91C422.207 763.422 420.84 808.914 417.172 824.183C413.242 840.535 407.91 822.078 407.371 814.855C406.898 808.582 404.297 770.457 406.367 769.636Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M423.04 70.3466C409.333 52.6982 394.817 41.038 390.61 44.2958C386.403 47.5654 394.102 64.5185 407.809 82.1669C421.513 99.8154 436.032 111.483 440.239 108.218C444.442 104.956 436.743 87.9951 423.04 70.3466Z" fill="#FEFEFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M93.054 80.4379C78.9641 97.7894 64.1907 109.129 60.0579 105.77C55.9251 102.407 63.9954 85.6293 78.0852 68.2894C92.1751 50.9379 106.949 39.598 111.081 42.9574C115.214 46.3168 107.144 63.098 93.054 80.4379Z" fill="#FEFEFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M338.734 20.8827C338.679 25.9452 298.3 29.6053 248.55 29.0545C198.8 28.5038 158.511 23.953 158.57 18.8944C158.625 13.8319 199 10.1756 248.753 10.7225C298.503 11.2655 338.792 15.8123 338.734 20.8827Z" fill="black"/>
<path d="M102.048 68.2578C82.7311 123.516 78.1803 215.539 78.485 275.32C78.5632 290.098 71.8639 277.766 72.5632 292.977C75.6335 359.543 97.8171 448.633 104.969 522.363C113.719 612.613 104.903 722 99.8717 812.668C98.4538 836.336 83.2702 985.457 99.1686 991.266" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M399.484 70.4258C418.347 117.633 421.144 219.664 418.355 273.992C417.288 294.711 425.574 288.031 421.48 314.848C406.792 411.074 385.769 487.75 382.738 588.66C381.265 637.809 405.3 979.633 379.284 995.703" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M380.234 968.504L377.265 1053.27" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M99.4565 962.648L99.5307 1048.93" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M377.531 1045.73C318.14 1074.55 156.128 1074.93 99.519 1039.98" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  const RedStaticIcon = L.divIcon({
    className: "",
    html: `
<svg width="19.84" height="43.16" viewBox="0 0 495 1078" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M35.1527 544.536C33.8442 537.853 32.9262 528.552 34.1801 520.778C36.2152 508.153 39.4301 503.45 39.3402 497.282C39.2621 491.974 42.0121 400.392 42.7738 375.091C43.0199 367.005 44.6371 368.196 37.4027 370.278C26.8051 373.325 4.54728 379.583 1.91447 379.196C-1.55819 378.685 -0.937098 358.302 9.08634 352.247C16.7348 347.626 34.0473 343.665 41.8246 341.068C47.7231 339.095 45.7973 337.704 46.0551 330.716C46.8168 310.06 48.5473 256.357 46.184 227.318C43.2621 191.403 41.7387 142.704 53.352 107.275C71.4535 52.0323 111.793 20.423 165.414 6.28235C198.789 -2.51843 294.723 -1.2489 324.446 4.99329C363.422 13.173 412.223 37.8409 432.032 74.2433C443.168 94.6925 451.981 120.071 453.133 145.982C454.653 180.138 449.43 252.47 449.133 279.337C448.907 299.989 449.164 327.325 450.227 339.31C450.868 346.544 450.356 345.126 456.844 346.767C466.801 349.278 487.032 355.13 490.692 366.65C495.426 381.56 495.711 384.251 491.77 383.259C489.137 382.595 471.289 377.173 459.832 374.88C447.43 372.4 450.161 373.439 450.34 384.818C450.758 411.083 451.614 480.571 452.34 501.802C452.575 508.751 453.121 508.689 455.039 515.294C456.692 520.978 458.567 528.798 458.645 535.107C458.719 541.314 456.551 547.091 454.586 551.478C451.786 557.724 451.594 556.798 451.313 563.591C450.071 593.685 447.758 734.614 448.512 737.474C449.344 740.642 454.356 759.271 452.18 770.47C450 781.669 447.301 782.665 447.036 792.462C446.954 795.462 449.024 828.923 445.836 858.653C444.129 874.575 437.946 881.396 435.739 899.857C430.489 943.747 424.2 989.642 418.579 1013.64C413.422 1035.67 400.625 1045.92 378.579 1052.2C370.368 1054.54 355.903 1062.59 334.829 1068.87C292.649 1081.43 189.336 1079.47 148.735 1068.48C113.438 1058.93 105.95 1049.83 100.43 1048.83C94.9067 1047.82 69.141 1033.62 66.3832 1025.77C63.6215 1017.92 45.8481 909.607 43.2152 876.228C42.2309 863.782 39.5942 848.501 38.9106 832.075C37.7621 804.454 38.7817 776.45 38.016 774.064C36.7934 770.259 34.5395 759.325 35.1567 746.532C35.6723 735.825 39.2621 731.443 39.2074 722.552C39.0512 697.079 38.2738 587.888 37.8051 559.661C37.6723 551.642 36.6293 552.064 35.1527 544.536Z" fill="#CC2628"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M63.9227 757.075C66.2781 758.837 69.8524 761.302 73.5399 763.083C75.3367 763.95 76.6961 764.599 77.7235 765.083C82.2235 767.208 80.8406 765.888 80.3797 772.423C79.3133 787.552 76.1258 826.349 71.4149 826.677C65.5633 827.087 64.0828 815.665 63.3914 801.774C62.8641 791.235 61.7352 769.88 61.3016 760.048C61.0203 753.677 60.1024 754.216 63.9227 757.075Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M60.8962 734.18C60.9314 718.055 58.4665 615.914 57.9665 595.399C57.8572 590.864 57.0056 591.457 60.6814 593.094C64.2478 594.68 70.7165 597.426 77.1579 599.453C80.0056 600.352 82.1345 600.981 83.7204 601.418C89.3494 602.969 88.2322 600.926 88.0681 606.797C87.5134 626.813 85.1423 709.754 83.4314 733.164C82.3845 747.453 81.7556 754.887 81.3923 758.707C80.8962 763.977 81.8806 763.246 75.8962 760.141C69.9353 757.047 60.8611 751.68 60.904 747.696C60.9705 741.77 60.8962 734.18 60.8962 734.18Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M58.7111 516.19C58.8127 506.937 62.2619 405.483 63.3048 374.964C63.547 367.858 62.3791 361.448 68.0236 372.288C71.5666 379.093 76.5236 393.347 80.1291 422.698C86.3634 473.503 87.3166 501.808 88.1642 525.21C88.7541 541.44 88.6056 558.995 88.4611 568.229C88.3283 576.612 89.9611 575.765 81.672 571.433C72.7853 566.792 58.1642 558.37 58.2189 553.253C58.3009 545.905 58.7111 516.19 58.7111 516.19Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M99.9578 428.918C95.4031 399.981 76.0984 299.965 84.032 297.731C151.528 278.688 166.419 271.278 237.68 273.278C312.458 275.371 415.001 285.703 415.391 306.121C415.559 315.09 400.239 400.473 391.977 430.192C388.727 441.875 390.27 440.875 380.528 438.875C361.243 434.914 308.247 424.336 254.923 424.008C204.544 423.703 155.61 427.305 105.88 434.625C99.0398 435.633 101.196 436.785 99.9578 428.918Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M129.855 542.762C130.187 512.602 155.136 488.196 185.3 488.528L309.203 489.895C339.367 490.227 363.773 515.176 363.441 545.336C363.109 575.501 338.156 599.907 307.996 599.575L184.089 598.208C153.929 597.876 129.523 572.926 129.855 542.762Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M111.821 828.234C125.864 831.312 155.942 837.699 188.146 841.363C232.919 846.461 289.06 844.507 333.345 837.73C346.099 835.777 358.446 833.316 366.958 831.5C381.044 828.496 378.146 825.722 378.63 839.386C379.771 871.461 382.888 966.73 379.72 968.007C315.071 994.109 268.7 992.461 202.231 985.89C154.356 981.16 98.8252 972.734 98.7666 961.121C98.6963 948.363 102.317 855.519 103.478 831.941C103.845 824.429 102.759 826.25 111.821 828.234Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M399.982 541.792C400.228 519.191 408.564 444.202 411.619 424.956C413.822 411.077 418.264 391.8 421.139 381.538C422.857 375.406 428.217 365.284 428.721 379.226C429.037 388.007 429.869 520.074 430.072 553.046C430.127 561.507 431.779 559.331 425.553 563.781C417.377 569.613 400.967 580.796 399.58 577.589C397.732 573.3 399.982 541.792 399.982 541.792Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M400.711 733.13C400.231 716.661 398.817 637.669 399.129 612.685C399.227 604.849 397.77 605.626 403.488 603.962C408.703 602.443 417.785 599.81 423.297 598.724C429.102 597.583 427.992 597.86 427.852 603.044C427.231 625.696 424.027 727.763 422.684 749.966C422.395 754.743 423.09 753.9 419.207 756.474C413.797 760.068 403.203 766.232 402.512 763.263C401.606 759.38 400.711 733.13 400.711 733.13Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M405.852 769.144C407.598 768.453 421.286 759.676 421.504 761.418C421.692 762.929 420.325 808.422 416.657 823.691C412.727 840.043 407.395 821.586 406.856 814.363C406.383 808.09 403.782 769.965 405.852 769.144Z" fill="#203548"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M422.525 69.8544C408.818 52.206 394.302 40.5458 390.095 43.8037C385.888 47.0732 393.587 64.0263 407.294 81.6748C420.997 99.3232 435.517 110.991 439.724 107.726C443.927 104.464 436.228 87.5029 422.525 69.8544Z" fill="#FEFEFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M92.5389 79.9457C78.4491 97.2972 63.6756 108.637 59.5428 105.278C55.41 101.914 63.4803 85.1371 77.5702 67.7972C91.66 50.4457 106.433 39.1058 110.566 42.4652C114.699 45.8246 106.629 62.6058 92.5389 79.9457Z" fill="#FEFEFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M338.219 20.3905C338.164 25.453 297.785 29.1131 248.035 28.5623C198.285 28.0116 157.996 23.4608 158.055 18.4022C158.109 13.3397 198.484 9.68344 248.238 10.2303C297.988 10.7733 338.277 15.3202 338.219 20.3905Z" fill="black"/>
<path d="M101.532 67.7656C82.216 123.023 77.6653 215.047 77.97 274.828C78.0481 289.605 71.3489 277.273 72.0481 292.484C75.1184 359.051 97.302 448.141 104.454 521.871C113.204 612.121 104.388 721.508 99.3567 812.176C97.9387 835.844 82.7551 984.965 98.6535 990.773" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M398.969 69.9336C417.832 117.141 420.629 219.172 417.84 273.5C416.773 294.219 425.058 287.539 420.965 314.355C406.277 410.582 385.254 487.258 382.223 588.168C380.75 637.316 404.785 979.141 378.769 995.211" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M379.719 968.012L376.75 1052.78" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M98.9414 962.156L99.0156 1048.44" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M377.016 1045.24C317.625 1074.06 155.613 1074.44 99.0039 1039.49" stroke="#FEFEFE" stroke-width="1.01145" stroke-miterlimit="22.9256" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  const LocationMarker = ({ device }) => {
    const [isOnline, setIsOnline] = useState(true)

    const markerRef = useRef(null)

    useEffect(() => {
      const checkStatus = () => {
        const timestampMs = parseInt(device.timestamp)
        const online = Date.now() - timestampMs < 30000 // 1 min 15 sec
        setIsOnline(online)
      }

      // Check immediately on mount
      checkStatus()

      // Recheck every 15 seconds
      const interval = setInterval(checkStatus, 5000)

      // Cleanup
      return () => clearInterval(interval)
    }, [device.timestamp])

    useEffect(() => {
      if (markerRef.current) {
        markerRef.current.openPopup()
      }
    }, [])

    if (!device?.position) return null

    const icon = isOnline ? GreenPingingIcon : RedStaticIcon

    return (
      <ReactLeaflet.Marker
        ref={markerRef}
        position={device?.position}
        icon={icon}
      >
        <ReactLeaflet.Popup>
          <PopupContent device={device} />
        </ReactLeaflet.Popup>
      </ReactLeaflet.Marker>
    )
  }

  if (defaultCenter?.length > 1)
    return (
      <MapContainer
        className="h-[calc(100vh-270px)] col-span-8"
        zoom={17}
        center={defaultCenter}
      >
        <ReactLeaflet.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCenterUpdater position={defaultCenter} />
        {devices?.map((device, i) => (
          <LocationMarker key={i} device={device} />
        ))}
      </MapContainer>
    )

  return <p>Loading...</p>
}

export default Map
