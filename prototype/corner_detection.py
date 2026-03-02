import numpy as np
import cv2 as cv
import matplotlib.pyplot as plt
import math


# TODO: tune downsample width. Find smallest width that still results in decent enough accuracy
DOWNSAMPLE_WIDTH = 800

def main():
    # Read image, convert from BGR to RGB
    img_original = cv.imread("../public/test_doc.png")
    img_original = cv.cvtColor(img_original, cv.COLOR_BGR2RGB)

    img = img_original.copy()
    plt.imshow(img)
    plt.show()

    # Downsample
    input_height = img.shape[0]
    input_width = img.shape[1]
    new_width = DOWNSAMPLE_WIDTH
    new_height = int(new_width * (input_height / input_width))
    img = cv.resize(img, (new_width, new_height))

    ## Convert to B/W
    img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    plt.imshow(img, cmap="gray")
    plt.show()

    ## Blur
    kernel = np.ones((6,6),np.float32)/36
    img = cv.filter2D(img, -1, kernel)
    plt.imshow(img, cmap="gray")
    plt.show()

    ## Thresholding (OTSU)
    ret, img = cv.threshold(img, 0, 255, cv.THRESH_BINARY+cv.THRESH_OTSU)

    ## TODO: How to verify if otsu thresholding worked? If background is not different enough it might worsen the result?

    plt.imshow(img, cmap="gray")
    plt.show()

    ## Find contours and select the one most similar to a doc
    contours, _ = cv.findContours(img, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    
    for contour in contours:
        arc_len = cv.arcLength(contour, True)
        approx = cv.approxPolyDP(contour, 0.02 * arc_len, True)

        if len(approx) == 4:
            doc_contour = approx
            break
    
    img_cont = np.zeros(img.shape)
    img_cont = cv.drawContours(img_cont, [doc_contour], -1, 255, 1)

    plt.imshow(img_cont, cmap="gray")
    plt.show()

    print(f"corners before transformation: {doc_contour}")
    corners = doc_contour * (input_width/new_width)
    print(f"corners: {corners}")

    for corner in corners:
        cx = int(round(corner[0, 0]))
        cy = int(round(corner[0, 1]))
        print(cx, cy)
        img_original = cv.circle(img_original, (cx, cy), 25, (255, 0, 0), thickness=-1)

    plt.imshow(img_original)
    plt.show()

if __name__ == "__main__":
    main()